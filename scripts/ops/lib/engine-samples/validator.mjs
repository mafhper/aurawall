export function validateOptions(options) {
  const errors = [...(options.parseErrors || [])];

  if (!Number.isInteger(options.width) || options.width < 320) {
    errors.push('Largura deve ser um número inteiro ≥ 320.');
  }
  if (!Number.isInteger(options.height) || options.height < 320) {
    errors.push('Altura deve ser um número inteiro ≥ 320.');
  }
  if (!Number.isInteger(options.count) || options.count < 0) {
    errors.push('O número de amostras deve ser um inteiro não negativo.');
  }
  if (options.quality < 40 || options.quality > 100 || !Number.isInteger(options.quality)) {
    errors.push('Qualidade JPEG deve ser um inteiro entre 40 e 100.');
  }
  if (options.concurrency < 1 || options.concurrency > 10) {
    errors.push('Concorrência deve ser um inteiro entre 1 e 10.');
  }
  if (!Array.isArray(options.formats) || options.formats.length === 0) {
    errors.push('Pelo menos um formato de saída deve ser escolhido (svg, jpg).');
  } else {
    const validFormats = ['svg', 'jpg', 'jpeg'];
    for (const fmt of options.formats) {
      if (!validFormats.includes(fmt)) {
        errors.push(`Formato inválido: "${fmt}". Use svg, jpg ou jpeg.`);
      }
    }
  }
  if (!Array.isArray(options.engines) || options.engines.length === 0) {
    errors.push('Selecione pelo menos uma engine.');
  }
  if (options.seeds && !Array.isArray(options.seeds)) {
    errors.push('Seeds devem ser um array de números.');
  }

  return errors;
}