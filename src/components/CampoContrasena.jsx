import { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa6';

export default function CampoContrasena({
  etiqueta,
  value,
  onChange,
  autoComplete,
  minLength,
  ayuda,
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="calculadora-campo">
      <label>{etiqueta}</label>

      <div className="campo-contrasena">
        <input
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          minLength={minLength}
          required
        />
        <button
          type="button"
          className="campo-contrasena-ojo"
          onClick={() => setVisible(!visible)}
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          aria-pressed={visible}
        >
          {visible ? <FaEyeSlash aria-hidden="true" /> : <FaEye aria-hidden="true" />}
        </button>
      </div>

      {ayuda && <small className="perfil-ayuda">{ayuda}</small>}
    </div>
  );
}