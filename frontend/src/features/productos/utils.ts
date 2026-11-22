const formatoPesos = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 2 });

export const formatearPrecio = (valor: number): string => formatoPesos.format(valor);
