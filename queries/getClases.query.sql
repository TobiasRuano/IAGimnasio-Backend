select Appointments.name, UserAppointments.userID from UserAppointments
	join Appointments
		on Appointments.id = UserAppointments.appointmentID