import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({plugins:[react()],server:{watch:{ignored:['**/antigravity_2d_virtual_office_prompt.md']}}});
