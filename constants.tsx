
import React from 'react';
import { FoodStyle, StyleOption } from './types';
import { Moon, Sun, Wind, Coffee, Smartphone } from 'lucide-react';

export const STYLE_OPTIONS: StyleOption[] = [
  {
    id: FoodStyle.ELEGANT_DARK,
    name: '高級暗調',
    description: '黑石板、戲劇性光影、奢華質感',
    preview: 'https://picsum.photos/seed/food1/300/200',
    prompt: 'Professional commercial food photography, high-end restaurant style, dark moody atmosphere, dramatic side lighting, slate background, garnish details, 8k resolution, bokeh.'
  },
  {
    id: FoodStyle.FRESH_BRIGHT,
    name: '清新野餐',
    description: '格紋桌布、陽光、戶外氛圍',
    preview: 'https://picsum.photos/seed/food2/300/200',
    prompt: 'Bright and airy commercial food photography, morning sunlight, soft shadows, checkered picnic cloth background, fresh herbs, vibrant colors, shallow depth of field.'
  },
  {
    id: FoodStyle.JAPANESE_ZEN,
    name: '日式和風',
    description: '木質餐具、簡約、禪意',
    preview: 'https://picsum.photos/seed/food3/300/200',
    prompt: 'Japanese Zen style food photography, warm wooden textures, minimal arrangement, soft natural lighting, traditional ceramics, high contrast of textures, clean background.'
  },
  {
    id: FoodStyle.RUSTIC_VINTAGE,
    name: '鄉村復古',
    description: '舊木桌、麻布、溫馨質感',
    preview: 'https://picsum.photos/seed/food4/300/200',
    prompt: 'Rustic vintage style food photography, aged wood table, linen napkins, warm nostalgic lighting, farm-to-table aesthetic, textured background, professional plating.'
  },
  {
    id: FoodStyle.MINIMALIST_MODERN,
    name: '現代簡約',
    description: '純色背景、乾淨俐落',
    preview: 'https://picsum.photos/seed/food5/300/200',
    prompt: 'Minimalist modern food photography, solid neutral background, sharp focus, overhead studio lighting, clean lines, contemporary plating, pop of color.'
  }
];
