export default function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  let status = Number.isInteger(error.status) && error.status >= 400 && error.status < 500
    ? error.status
    : 500;
  let code = error.code ?? 'BAD_REQUEST';
  let message = error.message;

  if (error.type === 'entity.parse.failed') {
    status = 400;
    code = 'INVALID_JSON';
    message = 'Geçerli bir JSON gövdesi gönderilmelidir.';
  } else if (error.type === 'entity.too.large') {
    code = 'PAYLOAD_TOO_LARGE';
    message = 'İstek gövdesi boyut sınırını aşıyor.';
  } else if (status === 500) {
    code = 'INTERNAL_ERROR';
    message = 'Beklenmeyen bir sunucu hatası oluştu.';
    console.error(error);
  }

  return res.status(status).json({ error: { code, message } });
}
