select b.id, b.name, b.surname, b.dni, b.email, b.birthday, b.address, b.phone, Subscriptions.type, HealthRecords.medicalDischarge, HealthRecords.data as healthData from
	(select * from Users
		where Users.dni = :userDNI) as b
	left join (select * from UserSubscriptions where UserSubscriptions.endDate > :today) as a
		on b.id = a.userID
	left join Subscriptions 
		on Subscriptions.id = a.subscriptionID
    left join HealthRecords 
		on HealthRecords.id = b.healthDataID
    LIMIT 1