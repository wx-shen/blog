import type React from 'react';
import type { SceneProps } from './components/SceneShell';
import type { SceneId } from './scenes';
import { Scene01Intro } from './scenes/Scene01Intro';
import { Scene02Prehistory } from './scenes/Scene02Prehistory';
import { Scene03Birth } from './scenes/Scene03Birth';
import { Scene04Rise } from './scenes/Scene04Rise';
import { Scene05Iteration } from './scenes/Scene05Iteration';
import { Scene06ConfigPain } from './scenes/Scene06ConfigPain';
import { Scene07Webpack5 } from './scenes/Scene07Webpack5';
import { Scene08BeyondBrowser } from './scenes/Scene08BeyondBrowser';
import { Scene09Limits } from './scenes/Scene09Limits';
import { Scene10Challengers } from './scenes/Scene10Challengers';
import { Scene11Migration } from './scenes/Scene11Migration';
import { Scene12Today } from './scenes/Scene12Today';
import { Scene13Outro } from './scenes/Scene13Outro';

/** 幕 id → 组件 */
export const sceneComponents: Record<SceneId, React.FC<SceneProps>> = {
  'scene01-intro': Scene01Intro,
  'scene02-prehistory': Scene02Prehistory,
  'scene03-birth': Scene03Birth,
  'scene04-rise': Scene04Rise,
  'scene05-iteration': Scene05Iteration,
  'scene06-config-pain': Scene06ConfigPain,
  'scene07-webpack5': Scene07Webpack5,
  'scene08-beyond': Scene08BeyondBrowser,
  'scene09-limits': Scene09Limits,
  'scene10-challengers': Scene10Challengers,
  'scene11-migration': Scene11Migration,
  'scene12-today': Scene12Today,
  'scene13-outro': Scene13Outro,
};
