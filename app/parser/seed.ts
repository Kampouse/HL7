import { MockData } from "./index"
import { useDB } from '~/server/db/drizzle';
import * as tables from '~/server/db/schema';

const main = () => {
    const db = useDB()

    const ouput = db.select().from(tables.userTable).execute().then((data) => {
        if (data.length > 0) {
            console.log("Data already is seeded. Exiting...")
            process.exit(0)
        }
        return data
    })
    const data = MockData().then((data) => {
        let sharedid = 0
        data?.transformed.forEach(async (element) => {
            const order_data = await db.insert(tables.orderInfoTable).values({
                testOrdered: element.orderInfo.testOrdered,
                observationDateTime: element.orderInfo.observationDateTime,
                orderStatus: element.orderInfo.orderStatus
            }).returning().execute()
            if (order_data) {
                order_data[0].id
                const patient_data = db.insert(tables.userTable).values({
                    patientID: element.patientInfo.patientID,
                    name: element.patientInfo.name,
                    dob: element.patientInfo.dob,
                    orderInfoTableId: order_data[0].id
                }).returning().execute()
                element.orderInfo.results.forEach(async (result) => {
                    const result_data = await db.insert(tables.results).values({
                        test: result.test,
                        value: result.value,
                        units: result.units,
                        referenceRange: result.referenceRange,
                        resultStatus: result.resultStatus,
                        orderInfoId: order_data[0].id
                    }).returning().execute()
                })
            }

        })



    })
}


main()
console.log("Data seeded successfully")



