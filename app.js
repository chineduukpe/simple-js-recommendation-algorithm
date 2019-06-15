$(document).ready(function () {
	console.log('App Started!')

	let training_data; //Parsed CSV to JSON data training data
	let student_result; // Parsed CSV to JSON student to recommend field
	let fields_data;
	let similarity_indexes;
	let distinct_fields = {};
	let distinct_student = {};

	// Get training data.
	$('input[name=datafile]').change(function (e) {
		let training_file = $(this).val();

		let fileStream = readFile(training_file);

		training_data = csvToJson(fileStream)
	});

	// Get the recommending student data
	$('input[name=studentfile]').change(function (e) {
		let student_file = $(this).val();

		let fileStream = readFile(student_file);

		student_result = csvToJson(fileStream)

	});
	// Get the fields file
	$('input[name=fieldsfile]').change(function (e) {
		let fields_file = $(this).val();

		let fileStream = readFile(fields_file);

		fields_data = csvToJson(fileStream)

	})

	$('input[type=file]').change(function () {
		compute()
	})

	// COMPUTE FUNCTION
	const compute = function (e) {

		/**
		 * CHECK IF TRAINING DATA, STUDENT RECORD AND MASTERS FIELDS HAS BEEN SET
		 */
		if (training_data && student_result && fields_data) {
			console.log(' READY TO CALCULATE SIMILARITY INDEX.')

			//Get all passed and failed courses by student
			let student_passed_courses = [];
			let student_failed_courses = [];

			// GET all students passed and failed courses SP and SF
			for (let key in student_result[0]) {
				if (typeof student_result[0][key] != 'undefined' && student_result[0][key] != '') {
					if (scoreToIndex(student_result[0][key]) > 2) {
						student_passed_courses[key] = student_result[0][key]
					} else {
						student_failed_courses[key] = student_result[0][key]
					}
				}
			}

			// Loop through the training data to calculate similarity index with students
			similarity_indexes = training_data.map(data => {
				let max;
				let similar_courses = {};
				let similar_courses_count;
				let similarity_index;
				let passed_courses = {};
				let failed_courses = {};
				let only_data_failed = {};
				let only_student_failed = {}
				// Check the number of courses failed by current student, above average and below average
				let data_taken_courses;

				// GET SIMILAR COURSES |A union B|
				for (let key in data) {
					//Skip the student IDs
					if (key == 'id') {

					} else {
						//Check if both took the course
						if ((typeof data[key] != 'undefined' && data[key] != '') && (typeof student_result[0][key] != 'undefined' && student_result[0][key] != '')) {
							// console.log('They both took the course')
							if (!similar_courses.hasOwnProperty(key)) {
								similar_courses_count++;
								similar_courses[key] = key;
							}
						}

					}
				}


				//Find number of failed courses and passed courses
				for (let key in similar_courses) {
					//If they both passed the course |SP intersect DP|
					if ((scoreToIndex(data[key]) > 4) && (scoreToIndex(student_result[0][key]) > 4)) {
						passed_courses[key] = key
					} else if ((scoreToIndex(data[key]) <= 4) && (scoreToIndex(student_result[0][key]) <= 4)) {
						//if they both failed the course |SF intersect DF|
						failed_courses[key] = key
					}
					else if ((scoreToIndex(data[key]) <= 4) && (scoreToIndex(student_result[0][key]) > 4)) {
						only_data_failed[key] = key;
					}
					else if ((scoreToIndex(data[key]) > 4) && (scoreToIndex(student_result[0][key]) <= 4)) {
						only_student_failed[key] = key;
					}
				}

				// SIMILARITY INDEX = SP intersect DP + SF intersect DF / SP union SF union DP union DF
				similarity_index = (Object.keys(passed_courses).length + Object.keys(failed_courses).length - Object.keys(only_data_failed).length - Object.keys(only_student_failed).length) / (Object.keys(similar_courses).length);
				console.log('Similarity Index : ' + similarity_index)

				return {
					id: data['id'],
					similarity_index
				}
			}); //End loop of each data
			console.log(similarity_indexes)

			// GET ALL THE DISTINCT FIELDS
			fields_data.forEach(function (element) {
				distinct_fields[element.field] = element.field
				distinct_student[element.id] = element.field;
			});

			console.log(distinct_fields)

			// Summing similarity indices of each field
			let sum_similarity_indices = Object.keys(distinct_fields).map(field => {
				let sum = 0;
				let sub = 0;
				let passed = 0;
				let failed = 0;
				let num_students_studied_field = 0;

				console.log("SUM FIELD " + field)
				fields_data.map(data => {
					if (data.field === field) {

						num_students_studied_field++; //Increment number of students that took that field

						console.log("ID : " + data.id)
						console.log("FIELD : " + data.field)
						console.log(similarity_indexes[data.id])
						let pass_check = false;
						similarity_indexes.map(similar => {
							pass_check = false;
							if (similar.id === data.id) {
								sum += similar.similarity_index
								passed++;
							} else {
								if (similar.similarity_index) {
									failed++;
									sub += similar.similarity_index;
								}
							}
						})
						// sum += similarity_indexes[data.id]
					}
				})

				return {
					field,
					sum,
					sub,
					failed: fields_data.length - num_students_studied_field,
					passed: num_students_studied_field
				}
			});

			console.log('SImilarity SUm');
			console.log(sum_similarity_indices);
			console.log('SORTING BY NEAREST NEIGHBOUR: ');
			let sorted = sum_similarity_indices.sort((a, b) => {
				return Math.abs((a.sum - a.sub) / (a.passed + a.failed)) < ((b.sum - b.sub) / (b.passed + b.failed))
			})
			console.log('FIELD: \t\t\t\t\tRATING')
			sorted.map(field => {
				console.log(field.field + "\t\t\t\t\t" + Math.abs((field.sum - field.sub) / (field.passed + field.failed)))
			})

		}
	}

})