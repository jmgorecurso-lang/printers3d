import { useState } from 'react';

export default function Calculadora() {
    const [horas, setHoras] = useState('');
    const [minutos, setMinutos] = useState('');
    const [pesoUtilizado, setPesoUtilizado] = useState('');
    const [precioBobina, setPrecioBobina] = useState('');
    const [pesoBobina, setPesoBobina] = useState('');

    const [incluirLuz, setIncluirLuz] = useState(false);
    const [potencia, setPotencia] = useState('');
    const [precioKwh, setPrecioKwh] = useState('');
    // Convierte un valor de input (string) a número, tratando el vacío como 0
    const num = (valor) => parseFloat(valor.replace(',', '.')) || 0;
    const tiempoHoras = num(horas) + num(minutos) / 60;
    const precioPorGramo = num(pesoBobina) > 0 ? num(precioBobina) / num(pesoBobina) : 0;
    const costeFilamento = precioPorGramo * num(pesoUtilizado);
    const costeLuz = incluirLuz
        ? (num(potencia) / 1000) * tiempoHoras * num(precioKwh)
        : 0;
    const total = costeFilamento + costeLuz;

    const formatear = (n) => n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    return (
        <div className="calculadora">
            <h1>🧮 Calculadora de Costes</h1>
            <p>
                Calcula el coste de una pieza impresa en 3D a partir del filamento utilizado, y el consumo eléctrico.
            </p>
            <div className="calculadora-layout">
                <div className="calculadora-formulario">
                    <section className="calculadora-paso">
                        <h2>Tiempo de impresión</h2>
                        <div className="calculadora-fila">
                            <div className="calculadora-campo">
                                <label>Horas</label>
                                <input type="number" min="0" value={horas}
                                    on onChange={(e) => setHoras(e.target.value)}
                                    placeholder='0' />
                            </div>
                            <div className="calculadora-campo">
                                <label>Minutos</label>
                                <input type="number"
                                    min="0"
                                    max="59"
                                    value={minutos}
                                    onChange={(e) => setMinutos(e.target.value)}
                                    placeholder="0"
                                />
                            </div>
                        </div>
                    </section>
                    <section className="calculadora-paso">
                        <h2>Filamento</h2>
                        <div className="calculadora-campo">
                            <label>Gramos utilizados en la pieza</label>
                            <input type="number"
                                min="0"
                                value={pesoUtilizado}
                                onChange={(e) => setPesoUtilizado(e.target.value)}
                                placeholder="ej. 35"
                            />
                        </div>
                        <div className="calculadora-fila">
                            <div className="calculadora-campo">
                                <label>Precio de la bobina (€)</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={precioBobina}
                                    onChange={(e) => setPrecioBobina(e.target.value)}
                                    placeholder="ej. 19.90"
                                />
                            </div>
                            <div className="calculadora-campo">
                                <label>Peso de la bobina (g)</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={pesoBobina}
                                    onChange={(e) => setPesoBobina(e.target.value)}
                                    placeholder="ej. 1000"
                                />
                            </div>
                        </div>
                    </section>
                    <section className="calculadora-paso">
                        <div className="calculadora-paso-header">
                            <h2>Electricidad</h2>
                            <label className="calculadora-checkbox">
                                <input
                                    type="checkbox"
                                    checked={incluirLuz}
                                    onChange={(e) => setIncluirLuz(e.target.checked)}
                                />
                                Incluir
                            </label>
                        </div>

                        {incluirLuz && (
                            <div className="calculadora-fila">
                                <div className="calculadora-campo">
                                    <label>Consumo de la impresora (W)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={potencia}
                                        onChange={(e) => setPotencia(e.target.value)}
                                        placeholder="ej. 150"
                                    />
                                </div>
                                <div className="calculadora-campo">
                                    <label>Precio de la luz (€/kWh)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={precioKwh}
                                        onChange={(e) => setPrecioKwh(e.target.value)}
                                        placeholder="ej. 0.15"
                                    />
                                </div>
                            </div>
                        )}
                    </section>
                </div>

                <aside className="calculadora-resumen">
                    <h2>Resumen</h2>
                    <div className="calculadora-linea">
                        <span>Filamento</span>
                        <strong>{formatear(costeFilamento)} €</strong>
                    </div>
                    {incluirLuz && (
                        <div className="calculadora-linea">
                            <span>Electricidad</span>
                            <strong>{formatear(costeLuz)} €</strong>
                        </div>
                    )}
                    <div className="calculadora-linea calculadora-total">
                        <span>Coste total estimado</span>
                        <strong>{formatear(total)} €</strong>
                    </div>
                </aside>

            </div>
        </div>

    );


} 