import { createContext, useContext, useState } from 'react';

const ModalImpresoraContext = createContext(null);

export function ModalImpresoraProvider({ children }) {
  const [impresoraSeleccionada, setImpresoraSeleccionada] = useState(null);

  const abrirModal = (impresora) => setImpresoraSeleccionada(impresora);
  const cerrarModal = () => setImpresoraSeleccionada(null);

  return (
    <ModalImpresoraContext.Provider
      value={{ impresoraSeleccionada, abrirModal, cerrarModal }}
    >
      {children}
    </ModalImpresoraContext.Provider>
  );
}
// eslint-disable-next-line react-refresh/only-export-components
export function useModalImpresora() {
  const contexto = useContext(ModalImpresoraContext);
  if (!contexto) {
    throw new Error('useModalImpresora debe usarse dentro de ModalImpresoraProvider');
  }
  return contexto;
}