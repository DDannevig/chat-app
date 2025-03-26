# REST - WEBSOCKETS

REST es una arquitectura de diseño para software. Está pensado para que el servidor responda con recurso (frecuentemente un documento HTML) y que contenga toda la información necesaria para procesar la respuesta. Como resultado, ni el cliente ni el servidor necesitan recordar ningún estado de las comunicaciones entre mensajes ni mantener la conexión. 

Hoy en día se suele utilizar para describir cualquier interfaz entre sistemas que utilice directamente protocolo HTTP para obtener datos o indicar la ejecución de operaciones sobre los datos.

Websockets se refiere a un protocolo de conexión contínua entre sistemas. A diferencia de REST, que suele tener haber un mensaje por conexión, este persiste dicha conexión y permite comunicación bi-direccional. REST suele tener el formato de cliente solicita y servidor responde.

Websockets es utilizado cuando hay necesidad de comunicación en tiempo real, bidireccional y de bajo tiempo de latencia. Lo negativo es que requiere una conexión activa constantemente. 

Arquitectura REST es utilizada cuando no hay necesidad del cliente para responder, solo del servidor. Esto permite que el cliente haga un pedido de recurso, obtenga su respuesta y libere la conexión realizada con el servidor. Por su naturaleza, es muy utilizada para páginas web, se solicita el archivo HTML y se libera la conexión. De usarse websockets, habría un límite mucho más tangible en cuantos usuarios en paralelo puede manejar el servidor.  Subsecuentes pedidos se pueden hacer para alterar ciertos recursos del lado del servidor.
