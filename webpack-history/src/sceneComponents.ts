import type React from 'react';
import type { SceneProps } from './components/SceneShell';
import type { SceneId } from './scenes';
import { Scene01Intro } from './scenes/Scene01Intro';
import { Scene02Prehistory } from './scenes/Scene02Prehistory';
import { Scene03Birth } from './scenes/Scene03Birth';
import { Scene04Rise } from './scenes/Scene04Rise';
import { Scene05Iteration } from './scenes/Scene05Iteration';
import { Scene06ConfigPain } from './scenes/Scene06ConfigPain';
import { Scene07Challengers } from './scenes/Scene07Challengers';
import { Scene08Today } from './scenes/Scene08Today';

/** 幕 id → 组件 */
export const sceneComponents: Record<SceneId, React.FC<SceneProps>> = {
  'scene01-intro': Scene01Intro,
  'scene02-prehistory': Scene02Prehistory,
  'scene03-birth': Scene03Birth,
  'scene04-rise': Scene04Rise,
  'scene05-iteration': Scene05Iteration,
  'scene06-config-pain': Scene06ConfigPain,
  'scene07-challengers': Scene07Challengers,
  'scene08-today': Scene08Today,
};
