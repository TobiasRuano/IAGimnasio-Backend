select Appointments.id, Appointments.description, Appointments.name, Appointments.schedule, Appointments.trainnerID, Employees.name as trainnerName, Employees.surname as trainnerSurname from Appointments
	join Employees
		on Appointments.trainnerID = Employees.id