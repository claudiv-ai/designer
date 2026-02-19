import type { Express } from 'express';
import { readFile, writeFile, unlink, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join, relative } from 'path';
import {
  parseSpecFile,
  loadProject,
  resolveComponent,
  resolveInterface,
  diffCdml,
  assembleContext,
  loadContextManifest,
  parsePlanQuestions,
  questionsToFacts,
  allQuestionsAnswered,
  parseAspect,
  discoverAspects,
  type ComponentDefinition,
  type ProjectRegistry,
} from '@claudiv/core';
import { serializeComponent } from './serializer.js';

export function setupApi(app: Express, projectRoot: string) {
  let registry: ProjectRegistry | null = null;

  // Helper: load/refresh project registry
  async function getRegistry(): Promise<ProjectRegistry | null> {
    const manifestPath = join(projectRoot, 'claudiv.project.cdml');
    if (!existsSync(manifestPath)) return null;
    try {
      registry = await loadProject(manifestPath);
      return registry;
    } catch {
      return null;
    }
  }

  // Helper: find all .cdml files
  async function findCdmlFiles(): Promise<string[]> {
    const files: string[] = [];
    await walkForCdml(projectRoot, files, [
      'node_modules', '.git', '.claudiv', 'dist', 'build',
    ]);
    return files;
  }

  // GET /api/project — Load project registry
  app.get('/api/project', async (_req, res) => {
    try {
      const reg = await getRegistry();
      if (!reg) {
        res.json({ name: 'unknown', components: [] });
        return;
      }
      res.json({
        name: reg.currentProject,
        components: Array.from(reg.components.entries()).map(([fqn, comp]) => ({
          fqn,
          name: comp.name,
          file: comp.file,
        })),
      });
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });

  // GET /api/components — List all discovered components
  app.get('/api/components', async (_req, res) => {
    try {
      const files = await findCdmlFiles();
      const components: ComponentDefinition[] = [];
      for (const file of files) {
        try {
          const content = await readFile(file, 'utf-8');
          const parsed = parseSpecFile(content);
          if (parsed.component) {
            parsed.component.file = relative(projectRoot, file);
            components.push(parsed.component);
          }
        } catch {
          // skip unparseable files
        }
      }
      res.json(components);
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });

  // GET /api/component/:fqn — Get single component
  app.get('/api/component/:fqn', async (req, res) => {
    try {
      const reg = await getRegistry();
      if (!reg) {
        res.status(404).json({ error: 'No project manifest found' });
        return;
      }
      const comp = resolveComponent(req.params.fqn, reg);
      if (!comp) {
        res.status(404).json({ error: `Component not found: ${req.params.fqn}` });
        return;
      }
      res.json(comp);
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });

  // PUT /api/component/:fqn — Update component (writes .cdml)
  app.put('/api/component/:fqn', async (req, res) => {
    try {
      const component = req.body as ComponentDefinition;
      const cdml = serializeComponent(component);
      const filePath = join(projectRoot, component.file);
      await writeFile(filePath, cdml, 'utf-8');
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });

  // POST /api/component — Create new component
  app.post('/api/component', async (req, res) => {
    try {
      const component = req.body as ComponentDefinition;
      const cdml = serializeComponent(component);
      const filePath = join(projectRoot, component.file);
      const dir = join(filePath, '..');
      if (!existsSync(dir)) {
        await mkdir(dir, { recursive: true });
      }
      await writeFile(filePath, cdml, 'utf-8');
      res.json({ success: true, file: component.file });
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });

  // DELETE /api/component/:fqn — Delete component
  app.delete('/api/component/:fqn', async (req, res) => {
    try {
      const reg = await getRegistry();
      if (!reg) {
        res.status(404).json({ error: 'No project manifest found' });
        return;
      }
      const comp = resolveComponent(req.params.fqn, reg);
      if (!comp) {
        res.status(404).json({ error: `Component not found: ${req.params.fqn}` });
        return;
      }
      const filePath = join(projectRoot, comp.file);
      if (existsSync(filePath)) {
        await unlink(filePath);
      }
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });

  // GET /api/context/:fqn — Get context manifest for a component
  app.get('/api/context/:fqn', async (req, res) => {
    try {
      const reg = await getRegistry();
      if (!reg) {
        res.status(404).json({ error: 'No project manifest found' });
        return;
      }
      const comp = resolveComponent(req.params.fqn, reg);
      if (!comp) {
        res.status(404).json({ error: `Component not found: ${req.params.fqn}` });
        return;
      }
      const contextPath = join(projectRoot, '.claudiv', 'context.cdml');
      if (!existsSync(contextPath)) {
        res.json({ forFile: comp.file, global: { refs: [], facts: [] }, scopes: [] });
        return;
      }
      const manifest = await loadContextManifest(contextPath);
      res.json(manifest);
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });

  // GET /api/context/:fqn/assembled/:scope — Get assembled prompt for a scope
  app.get('/api/context/:fqn/assembled/:scope', async (req, res) => {
    try {
      const contextPath = join(projectRoot, '.claudiv', 'context.cdml');
      if (!existsSync(contextPath)) {
        res.status(404).json({ error: 'No context manifest found' });
        return;
      }
      const manifest = await loadContextManifest(contextPath);
      const reg = await getRegistry();
      // Create a minimal change object for context assembly
      const change = { type: 'modified' as const, tagName: 'scope', path: decodeURIComponent(req.params.scope) };
      const assembled = await assembleContext(change, decodeURIComponent(req.params.scope), manifest, reg, projectRoot);
      res.json({ prompt: assembled.prompt, facts: assembled.facts, refs: assembled.changeTargets });
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });

  // GET /api/diff/:file — Get diff for a .cdml file
  app.get('/api/diff/:file', async (req, res) => {
    try {
      const filePath = join(projectRoot, decodeURIComponent(req.params.file));
      if (!existsSync(filePath)) {
        res.status(404).json({ error: 'File not found' });
        return;
      }
      const current = await readFile(filePath, 'utf-8');
      // Try to read cached version
      const cachePath = join(projectRoot, '.claudiv', 'cache', decodeURIComponent(req.params.file));
      const cached = existsSync(cachePath) ? await readFile(cachePath, 'utf-8') : '';
      const diff = diffCdml(cached, current);
      res.json(diff);
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });

  // GET /api/aspects/:fqn — Get all aspects for a component
  app.get('/api/aspects/:fqn', async (req, res) => {
    try {
      const aspectsMap = await discoverAspects([projectRoot]);
      const componentAspects = aspectsMap.get(req.params.fqn) || [];
      res.json(componentAspects);
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });

  // POST /api/plan/answer — Submit plan:questions answers
  app.post('/api/plan/answer', async (req, res) => {
    try {
      const { file, answers } = req.body as { file: string; answers: Record<string, string> };
      const filePath = join(projectRoot, file);
      const content = await readFile(filePath, 'utf-8');
      const parsed = parseSpecFile(content);
      const questions = parsePlanQuestions(parsed.dom);

      // Fill in answers
      for (const q of questions) {
        if (answers[q.question]) {
          q.answer = answers[q.question];
        }
      }

      if (allQuestionsAnswered(questions)) {
        const facts = questionsToFacts(questions, `plan:${new Date().toISOString().split('T')[0]}`);
        // Remove plan:questions block from file
        parsed.dom('plan\\:questions').remove();
        // Note: facts should be persisted to context.cdml by the processing pipeline
        const updatedContent = parsed.dom.html() || content;
        await writeFile(filePath, updatedContent, 'utf-8');
        res.json({ success: true, facts });
      } else {
        res.json({ success: false, message: 'Not all questions answered' });
      }
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });

  // POST /api/generate/:fqn — Trigger generation for a component
  app.post('/api/generate/:fqn', async (req, res) => {
    try {
      // This would typically trigger the full processing pipeline
      // For now, return a placeholder indicating the generation was queued
      res.json({ status: 'queued', fqn: req.params.fqn });
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });
}

// Walk directory for .cdml files
async function walkForCdml(dir: string, results: string[], ignore: string[]): Promise<void> {
  const { readdir } = await import('fs/promises');
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (ignore.includes(entry.name) || entry.name.startsWith('.')) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      await walkForCdml(full, results, ignore);
    } else if (entry.name.endsWith('.cdml')) {
      results.push(full);
    }
  }
}
