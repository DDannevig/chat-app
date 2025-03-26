# TCP UDP

Dada la naturaleza errática de la transmisión de paquetes a través de internet:

TCP es un protocolo pensado para una transmisión de datos ordenada y sin errores. El remitente puede asegurar que llegó correctamente y sin modificaciones, pero de manera más lenta e ineficiente. Mantiene una conexión estable con el cliente mientras se realiza el envío de paquetes.

UDP está pensado para enviar mensajes sin asegurarse de que hayan sido recibidos correctamente (hay integridad del paquete, no certeza en que sea recibido). Más adecuado para transmisiones en tiempo real, ya que no establece una conexión.