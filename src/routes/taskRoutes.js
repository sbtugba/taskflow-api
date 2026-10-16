import { Router } from 'express';
import * as controller from '../controllers/taskController.js';

const router = Router();

router.use((req, res, next) => {
  if (['POST', 'PUT'].includes(req.method) && !req.is('application/json')) {
    return next(Object.assign(new Error('Content-Type application/json olmalıdır.'), {
      status: 415, code: 'UNSUPPORTED_MEDIA_TYPE'
    }));
  }
  next();
});

router.route('/').post(controller.createTask).get(controller.listTasks);
router.route('/:id').get(controller.getTask).put(controller.updateTask).delete(controller.deleteTask);

export default router;
