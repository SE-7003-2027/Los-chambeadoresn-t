## Descripción

<!-- Explica qué problema resuelve este PR y qué cambios introduce. -->
ESte Pr introduce un cambio total en la interfaz, tanto en el front, como el el back, primero en el fornt se tiene nuevas ventanas disponibles como lo es el login, una ventana para conectar tu cuenta de last.fm y ver estadisticas, tambièn una ventana para ver los conciertos disponibles con filtros disponibles, asì como otra ventana con datos un poco màs particulares de cada eveneto.
Por otro lado se actualiza la documentaciòn ya que se cabiaron varias cosas, se actualizò el archivo README.md, cmo asì tambieèn se creo la carpeta issue_template, y doscs, para los ADR, PDR, bug reports y feature request 

## Tipo de cambio

- [ ] Bugfix
- [x] Feature
- [ ] Refactor
- [x] Documentación
- [x] Cambio de configuración

## Alcance

<!-- Indica las áreas afectadas-->
En general las areas cambiadas fueron frontend, backend, Docker, documentación.

## Checklist

- [x] Mi código sigue el estilo del proyecto.
- [x] He probado los cambios localmente.
- [x] He ejecutado `npm run lint` y `npm run build` si aplica.
- [x] He validado Docker Compose si el cambio afecta los contenedores.
- [x] He actualizado la documentación si era necesario.
- [x] No he incluido claves, contraseñas, tokens ni datos personales.
- [ ] He resuelto los conflictos de merge.

## Pruebas realizadas

<!-- Describe los comandos o escenarios que validaste. -->
En el login se validaron que el correo cuanpla con la estructura habitual de correo 'examp@mail.com'

En la parte de de las estadisticas y de ingresar el usuario last.fm, se comprueba que el usuario exista.

En la parte de conciertos se agrega un simbolo con un porcentaje de afinidad, este desaparece si no se tiene una cuenta last.fm ya que no hay gustos por comparar.


## Capturas o evidencia

<!-- Añade capturas, respuestas de API o logs relevantes cuando aplique. -->
