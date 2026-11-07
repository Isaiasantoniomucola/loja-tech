// Preço em Kwanzas com o "Kz" mais pequeno: 85.500 Kz
export default function Preco({ valor, className = '' }) {
  const numero = Math.round(Number(valor)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return (
    <span className={`preco ${className}`.trim()}>
      <span>{numero}</span><i>Kz</i>
    </span>
  );
}
