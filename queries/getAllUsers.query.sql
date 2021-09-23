select Users.id, Users.name, Users.surname, Users.dni, Users.email, Users.birthday, Users.address, Users.phone, a.subscriptionType, HealthRecords.medicalDischarge, HealthRecords.data from Users 
	left join (select * from UserSubscriptions where UserSubscriptions.endDate > :today) as a
		on Users.id = a.userID
    left join HealthRecords 
		on HealthRecords.userID = Users.id
