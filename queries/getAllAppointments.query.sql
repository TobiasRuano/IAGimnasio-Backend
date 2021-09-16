select Appointments.id, Appointments.description, Appointments.name, Appointments.schedule, Appointments.trainnerID, Employees.name, Employees.surname from Appointments
	join Employees
		on Appointments.trainnerID = Employees.id