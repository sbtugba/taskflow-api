export default function notFound(req, res, next) {
  const error = new Error('Endpoint bulunamadı.');
  error.status = 404;
  error.code = 'ROUTE_NOT_FOUND';
  next(error);
}
