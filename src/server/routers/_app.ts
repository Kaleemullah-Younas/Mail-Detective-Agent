import { router } from '../trpc';

import { testRouter } from './testing';
import { profileRouter } from './profile';
import { savedEmailRouter } from './savedEmail';
import { investigationBatchRouter } from './investigationBatch';

export const appRouter = router({
  test: testRouter,
  profile: profileRouter,
  savedEmail: savedEmailRouter,
  investigationBatch: investigationBatchRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
