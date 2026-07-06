Este es el procedimiento que mi profesor me pide seguir para cada una de las nuevas features creadas

1.-Lo primero sera ubicarme en la rama develop: git checkout develop
2.-Lo segundo es crear una nueva rama con prejifo feature/: git checkout -b "feature/nombre-descriptivo-para-la-nueva-rama
3.-Realizar cambios acorde a la descripcion de la rama
4.-Añadir los cambios: git add .
5.-Generar commit con nombre descriptivo para seguimiento: git commit -m "nombre descriptivo para el commit"
6.-Push: git push -u origin feature/nombre-descriptivo-para-la-nueva-rama
7.-Hacer checkout a develop: git chekout develop
8.-Hacer merge en develop para traer los cambios de feature/nombre-descriptivo-para-la-nueva-rama: git merge develop feature/nombre-descriptivo-para-la-nueva-rama
9.-Finalmente hacer push a develop: git push -u origin develop
