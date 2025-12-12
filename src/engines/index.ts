import { EngineDefinition } from '../types';
import { borealEngine } from './boreal';
import { chromaEngine } from './chroma';
import { lavaEngine } from './lava';
import { midnightEngine } from './midnight';
import { geometricaEngine } from './geometrica';
import { glitchEngine } from './glitch';
import { sakuraEngine } from './sakura';
import { emberEngine } from './ember';
import { oceanicEngine } from './oceanic';

export const engines: Record<string, EngineDefinition> = {
  [borealEngine.id]: borealEngine,
  [chromaEngine.id]: chromaEngine,
  [lavaEngine.id]: lavaEngine,
  [midnightEngine.id]: midnightEngine,
  [geometricaEngine.id]: geometricaEngine,
  [glitchEngine.id]: glitchEngine,
  [sakuraEngine.id]: sakuraEngine,
  [emberEngine.id]: emberEngine,
  [oceanicEngine.id]: oceanicEngine,
};

export const getEngine = (id: string): EngineDefinition | undefined => engines[id];
export const getAllEngines = (): EngineDefinition[] => Object.values(engines);
