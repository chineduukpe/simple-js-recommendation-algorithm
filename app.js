$(document).ready(function () {
	console.log('App Started!')

	let training_data; //Parsed CSV to JSON data training data
	let student_result; // Parsed CSV to JSON student to recommend field
	let fields_data;
	let similarity_indices;
	let distinct_fields = {};
	let distinct_student = {};
	let start_time = 0;
	let end_time = 0;
	let counter = 0;

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

	$('input[type=button]').click(function () {
		if (!(training_data && student_result && fields_data)) {
			$('.card').css('color', 'red');
			$('.card').append("<br>\t\t YOU MUST ADD ALL TRAINING DATA....<br>")
			return;
		}

		start_time = Date.now()
		$('.card').css('color', '#45ac45');

		$('.card').html("")
		setTimeout(() => {
			$('.card').append("***************************All Files Loaded successfully\n*************************************<br>")
			setTimeout(() => {
				$('.card').append("<br>\t\t READY TO CALCULATE SIMILARITY INDEX....<br>")
				setTimeout(() => {
					$('.card').append("\r\t\t GENERATING SET SP AND SF....<br>")
					setTimeout(() => {
						$('.card').append("\r\t\t READY TO CALCULATE SIMILARITY INDICES....<br>")
						setTimeout(() => {
							$('.card').append("\r\t\t Computing")
							const interval_loop = setInterval(() => {
								counter++;
								$('.card').append(".")
								if (counter > 15) {
									$('.card').css('color', 'red');
									$('.card').html("An Error has occured! Check that your training data is a valid CSV file");
									return;
								}
								if (counter == 10) {
									clearInterval(interval_loop)
									compute()
								}
							}, 300)
						}, 1500)
					}, 1500)
				}, 2000)
			}, 800)
		}, 1000);
		// compute()
	})

	// COMPUTE FUNCTION
	const compute = function (e) {

		/**
		 * CHECK IF TRAINING DATA, STUDENT RECORD AND MASTERS FIELDS HAS BEEN SET
		 */
		if (training_data && student_result && fields_data) {
			console.log('**********All Files Loaded successfully\n*************************************\n\n')
			console.log('\t\t READY TO CALCULATE SIMILARITY INDEX....\n\n')
			if (training_data.length < 3 || fields_data.length < 3) {
				$('.card').css('color', 'red');
				$('.card').append("<br>\t\t The training data is not valid,<br>")
				$('.card').append("<br>\t\t  It is advisable to use a large dataset greater than 10 records..<br>")
				return;
			}

			//Variables to store passed and failed courses by student
			let student_passed_courses = [];
			let student_failed_courses = [];

			console.log('\t\t GENERATING SET SP AND SF....\n\n')
			// GET all student's passed and failed courses SP and SF
			for (let key in student_result[0]) {
				if (typeof student_result[0][key] != 'undefined' && student_result[0][key] != '') {
					if (scoreToIndex(student_result[0][key]) > 2) {
						student_passed_courses[key] = student_result[0][key]
					} else {
						student_failed_courses[key] = student_result[0][key]
					}
				}
			}

			console.log('\t\t READY TO CALCULATE SIMILARITY INDICES....\n\n')
			// Loop through the training data to calculate similarity index of training data with students
			similarity_indices = training_data.map(data => {
				let max;
				let similar_courses = {};
				let similar_courses_count;
				let similarity_index;
				let passed_courses = {}; //COURSES BOTH TRAINING INDEX AND STUDENT PASSED
				let failed_courses = {}; //COURSES BOTH TRAINING INDEX AND STUDENT FAILED
				let only_data_failed = {}; //COURSES DATA INDEX FAILED BUT STUDENT PASSED
				let only_student_failed = {} // COURSES DATA INDEX PASSED BUT STUDENT FAILED
				// Check the number of courses failed by current student, above average and below average
				let data_taken_courses;

				// GET SIMILAR COURSES |A union B|
				for (let key in data) {
					//Skip the student IDs field
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

				$('.card').append(`<br><br>CALCULATING JACCARD\'S INDEX`)
				console.log('\n\t\t CALCULATING JACCARD\'S INDEX\n')
				// SIMILARITY INDEX = SP intersect DP + SF intersect DF / SP union SF union DP union DF
				similarity_index = (Object.keys(passed_courses).length + Object.keys(failed_courses).length - Object.keys(only_data_failed).length - Object.keys(only_student_failed).length) / (Object.keys(similar_courses).length);

				$('.card').append(`<br>Similarity Index with ${data.id} : \t ${similarity_index}`)
				console.log(`Similarity Index with ${data.id} : \t ${similarity_index}`)

				return {
					id: data['id'],
					similarity_index
				}
			}); //End loop of each data
			console.log(similarity_indices)

			// GET ALL THE DISTINCT FIELDS

			$('.card').append(`<br><br><br>EXTRACTING ALL DISTINCT FIELDS FROM FIELD TRAINING DATA....`)
			console.log('\n\n\t\t EXTRACTING ALL DISTINCT FIELDS FROM FIELD TRAINING DATA....\n\n')
			fields_data.forEach(function (element) {
				distinct_fields[element.field] = element.field
				distinct_student[element.id] = element.field;
			});

			//This loop is just for debugging. It is entirely irrelevant to the computation

			console.log('FIELDS FOUND \n')
			console.log(distinct_fields)

			// Summing similarity indices of each field
			$('.card').append(`<br>SUMMING SIMILARITY INDEX FOR EACH FIELD.`)
			console.log('\t\t SUMMING SIMILARITY INDEX FOR EACH FIELD....\n\n')
			let sum_similarity_indices = Object.keys(distinct_fields).map(field => {
				let sum = 0;
				let sub = 0;
				let passed = 0;
				let failed = 0;
				let num_students_studied_field = 0;

				console.log("\n\nFIELD : " + field)
				fields_data.map(data => {
					if (data.field === field) {

						num_students_studied_field++; //Increment number of students that took that field

						console.log("ID : " + data.id)
						let pass_check = false;
						similarity_indices.map(similar => {
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
						// sum += similarity_indices[data.id]
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
			$('.card').append("<br><br>Similarity Sum")
			$('.card').append(sum_similarity_indices)
			console.log('SImilarity SUm');
			console.log(sum_similarity_indices);
			console.log('SORTING BY NEAREST NEIGHBOUR: ');
			$('.card').append("<br><br>SORTING BY NEAREST NEIGHBOUR:")
			let sorted = sum_similarity_indices.sort((a, b) => {
				return (Math.abs((a.sum - a.sub) / (a.passed + a.failed))) < (Math.abs((b.sum - b.sub) / (b.passed + b.failed)))
			})

			console.log('<br><br>\t\t RECOMMENDATION PROBABILITY....\n\n')
			console.log('<br><br>FIELD: \t\t\t\t\tRATING')
			sorted.map(field => {
				$('.card').append("<br>" + field.field + "\t\t\t\t\t" + Math.abs((field.sum - field.sub) / (field.passed + field.failed)))
				console.log(field.field + "\t\t\t\t\t" + Math.abs((field.sum - field.sub) / (field.passed + field.failed)))
			})

			$('.recommendations').append("<br><h3>TOP 5 RECOMMENDED FIELDS<h3> ");
			for (let i = 0; i < (sorted.length > 4 ? 5 : sorted.length); i++) {
				$('.recommendations').append("<br><h5 style='color: #000; font-size: .9em; margin: 0px auto; padding: 5px; font-family: open-sans'> " + (i + 1) + ": " + sorted[i]['field'] + "</h5>");
			}

			end_time = Date.now()
			$('.card').append('<br>--------------------------------------------------------------------------------------')
			$('.card').append('<br>DONE in ' + (end_time - start_time) / 1000 + " seconds")


		}
	}

})