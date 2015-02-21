# Seeds the database
# Please set PORT to the port that the app is running on

curl localhost:$PORT/api/users/register --form email=user1@example.com --form password=test
curl localhost:$PORT/api/users/register --form email=user2@example.com --form password=test
curl localhost:$PORT/api/users/register --form email=user3@example.com --form password=test
curl localhost:$PORT/api/users/register --form email=user4@example.com --form password=test
curl localhost:$PORT/api/users/register --form email=user5@example.com --form password=test
curl localhost:$PORT/api/users/register --form email=user6@example.com --form password=test
curl localhost:$PORT/api/users/register --form email=user7@example.com --form password=test
curl localhost:$PORT/api/users/register --form email=user8@example.com --form password=test
curl localhost:$PORT/api/users/register --form email=user9@example.com --form password=test
curl localhost:$PORT/api/users/register --form email=user10@example.com --form password=test

curl -H "Content-Type: application/json" -d '{"name":"John Doe", "school": "State University", "phone": "5555555555", "shirt":"M", "demographic":"true", "first":"false", "year":"Senior", "age":"21", "gender":"male", "major":"Computer Science", "conduct":"true", "travel":"false", "waiver":"true"}' user1%40example.com:test@localhost:$PORT/api/application/submit

curl -H "Content-Type: application/json" -d '{"name":"Jane Doe", "school": "University of College", "phone": "1234567890", "shirt":"S", "demographic":"true", "first":"true", "year":"Sophomore", "age":"20", "gender":"female", "major":"Marketing", "conduct":"true", "travel":"true", "waiver":"true", "dietary": "Vegetarian|Vegan"}' user2%40example.com:test@localhost:$PORT/api/application/submit

curl -H "Content-Type: application/json" -d '{"name":"Sally Smith", "school": "College of School", "phone": "2222222222", "shirt":"M", "demographic":"true", "first":"false", "year":"Junior", "age":"21", "gender":"female", "major":"Computer Science", "conduct":"true", "travel":"false", "waiver":"true", "dietary": "Gluten Free"}' user3%40example.com:test@localhost:$PORT/api/application/submit

curl -H "Content-Type: application/json" -d '{"name":"Sarah Brown", "school": "University of College", "phone": "3333333333", "shirt":"S", "demographic":"true", "first":"false", "year":"Sophomore", "age":"20", "gender":"female", "major":"Basket Weaving", "conduct":"true", "travel":"true", "waiver":"true"}' user4%40example.com:test@localhost:$PORT/api/application/submit

curl -H "Content-Type: application/json" -d '{"name":"William Johnson", "school": "State University", "phone": "4444444444", "shirt":"L", "demographic":"true", "first":"false", "year":"Senior", "age":"22", "gender":"male", "major":"Computer Science", "conduct":"true", "travel":"false", "waiver":"true"}' user5%40example.com:test@localhost:$PORT/api/application/submit

curl -H "Content-Type: application/json" -d '{"name":"Steve Williams", "school": "State University", "phone": "5555555555", "shirt":"XL", "demographic":"true", "first":"false", "year":"Freshman", "age":"19", "gender":"male", "major":"Computer Science", "conduct":"true", "travel":"false", "waiver":"true"}' user6%40example.com:test@localhost:$PORT/api/application/submit

curl -H "Content-Type: application/json" -d '{"name":"Dave Jones", "school": "University of College", "phone": "7777777777", "shirt":"M", "demographic":"true", "first":"true", "year":"Freshman", "age":"19", "gender":"male", "major":"Psychology", "conduct":"true", "travel":"false", "waiver":"true"}' user7%40example.com:test@localhost:$PORT/api/application/submit

curl -H "Content-Type: application/json" -d '{"name":"John Miller", "school": "College", "phone": "8888888888", "shirt":"L", "demographic":"true", "first":"false", "year":"Junior", "age":"20", "gender":"male", "major":"Computer Science", "conduct":"true", "travel":"true", "waiver":"true"}' user8%40example.com:test@localhost:$PORT/api/application/submit