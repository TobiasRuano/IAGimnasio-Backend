select Users.id, Users.name, Users.surname, Users.dni, Users.email, Users.birthday, Users.address, Users.phone, Subscriptions.type, HealthRecords.medicalDischarge, HealthRecords.data as healthData from Users 
	left join (select * from UserSubscriptions where UserSubscriptions.endDate > :today) as a
		on Users.id = a.userID
	left join Subscriptions 
		on Subscriptions.id = a.subscriptionID
    left join HealthRecords 
		on HealthRecords.userID = Users.id