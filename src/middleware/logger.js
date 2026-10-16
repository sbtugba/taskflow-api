export default function logger(req, res, next) {
  console.log(JSON.stringify({ method: req.method, endpoint: req.originalUrl,
    timestamp: new Date().toISOString() }));
  next();
}
