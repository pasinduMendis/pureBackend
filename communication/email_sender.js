const Model = require('../model/model');
var nodemailer = require('nodemailer');
const { google } = require('googleapis');
const fs = require('fs');

const SPREADSHEET_ID ='1CkVovxJTHrUiDjLN39bauzLEezQQmQR_8oAcuovMeyc';
const SHEET_TITLE = `Report`;

module.exports = {

    sendLostDataEmail : async function(){

        const reportData = await Model.find({
            $or: [
                {"applyUrl": {$exists: true, $in: ["", null]}},
                {"btnUrl": {$exists: true, $in: ["", null]}},
                {"address": {$exists: true, $in: ["", null]}},
                {"rentAmount": {$exists: true, $in: ["", null]}},
                {"depositAmount": {$exists: true, $in: ["", null]}},
                {"companyName": {$exists: true, $in: ["", null]}}
            ]
        },{
            "_id": 0,
            "id": 1,
            "applyUrl": 1,
            "btnUrl": 1,
            "address": 1,
            "rentAmount": 1,
            "depositAmount": 1,
            "companyName": 1,
            "pmName": 1,
            "pmEmail": 1,
        });

        if(reportData.length > 0){

            const missingDataList = [];

            sendMissingDataEmail();

            generateNewGoogleSpreadSheet();

            async function sendMissingDataEmail(){
                try{

                    const currentDate = new Date().toISOString().slice(0, 10);

                    for (let i = 0; i < reportData.length; i++) {

                        const missingDataColumn =[];
                        var newObject = {};

                        if(reportData[i].applyUrl == null || reportData[i].applyUrl =='' ){
                            missingDataColumn.push('application link');
                        }
                        if(reportData[i].btnUrl == null || reportData[i].btnUrl =='' ){
                            missingDataColumn.push('schedule viewing link');
                        }
                        if(reportData[i].address == null || reportData[i].address =='' ){
                            missingDataColumn.push('property address');
                        }
                        if(reportData[i].rentAmount == null || reportData[i].rentAmount =='' ){
                            missingDataColumn.push('rent rate');
                        }
                        if(reportData[i].depositAmount == null || reportData[i].depositAmount =='' ){
                            missingDataColumn.push('deposit rate');
                        }
                        if(reportData[i].companyName == null || reportData[i].companyName =='' ){
                            missingDataColumn.push('listing agent');
                        }

                        if(i==0){
                            newObject = {
                                Date: currentDate,
                                ID: reportData[i].id,
                                Address : reportData[i].address,
                                Missing_Data: missingDataColumn,
                                Tenant_Turner_Link : reportData[i].btnUrl,
                                PM_Name: reportData[i].pmName,
                                PM_Email: reportData[i].pmEmail
                            };
                        }else{
                            newObject = {
                                Date: '',
                                ID: reportData[i].id,
                                Address : reportData[i].address,
                                Missing_Data: missingDataColumn,
                                Tenant_Turner_Link : reportData[i].btnUrl,
                                PM_Name: reportData[i].pmName,
                                PM_Email: reportData[i].pmEmail,
                            };
                        }

                        missingDataList.push(newObject);
                    }

                    function generateHtmlTable(data) {
                        let html = '<table border="1">';

                        // Create table header from JSON keys
                        html += '<tr>';
                        for (const key in data[0]) {
                            html += `<th>${key}</th>`;
                        }
                        html += '</tr>';

                        // Create table rows from JSON data
                        data.forEach((item) => {
                            html += '<tr>';
                        for (const key in item) {
                            html += `<td>${item[key]}</td>`;
                        }
                        html += '</tr>';
                    });

                        html += '</table>';
                        return html;
                    }

                    const htmlTable = generateHtmlTable(missingDataList);

                    var transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                            user: 'tharindu@nobadbrands.com',
                            pass: 'rmukbxixsevyefgi'
                        }
                    });

                    var mailOptions = {
                        from: 'tharindu@nobadbrands.com',
                        to: 'tharindufernandoofficial@gmail.com',
                        subject: 'PurePM Missing Data Report',
                        html:htmlTable,
                    };

                    transporter.sendMail(mailOptions, function(error, info){
                        if (error) {
                            console.log(error);
                        } else {
                            console.log('Email sent: ' + info.response);
                        }
                    });

                }catch(e){
                    console.log('Error while sending email' + e);
                }
            }

            async function generateNewGoogleSpreadSheet(){

                try{
                    // const auth = new google.auth.GoogleAuth({
                    //     keyFile: 'credentials.json',
                    //     scopes: ['https://www.googleapis.com/auth/spreadsheets'],
                    // })

                    const auth = await google.auth.getClient({
                        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
                    })

                    const sheets = google.sheets({ version: 'v4', auth });

                    var values = missingDataList.map(item => [item.Date, item.ID, item.Address, item.Missing_Data.toString(), item.Tenant_Turner_Link, item.PM_Name, item.PM_Email, 'no']);

                    const response = await sheets.spreadsheets.values.get({
                        spreadsheetId: SPREADSHEET_ID,
                        range: SHEET_TITLE,
                    })


                    var existingValues = [];

                    if(response.data.values.length > 1){
                        response.data.values.shift();
                        existingValues = response.data.values;
                    }

                    var updatedValues = [];
                    updatedValues = values.concat(existingValues);

                    await sheets.spreadsheets.values.update({
                        spreadsheetId: SPREADSHEET_ID,
                        range: `${SHEET_TITLE}!A2`,
                        valueInputOption: 'USER_ENTERED',
                        resource: { values: updatedValues },
                    });

                    console.log(`New sheet '${SHEET_TITLE}' created and data added.`);

                }catch(e){
                    console.log('error creating new spreadsheet' + e);
                }
            }

        }else{
            console.log('There is no missing data columns to send Mail Report');
        }

    },

    sendUserInquiryEmail: function(details){

        const emailText = `Inquiry Details \n\n`
            + `Company Name: ${details.companyName},\n`
            + `Address: ${details.address},\n`
            + `Phone Number: ${details.phone},\n`
            + `Email: ${details.email},\n`
            + `Property Type: ${details.propertyType},\n`
            + `Message: ${details.message}`;

        var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'tharindu@nobadbrands.com',
                    pass: 'rmukbxixsevyefgi'
                }
        });

        var mailOptions = {
                from: 'tharindu@nobadbrands.com',
                to: 'tharindufernandoofficial@gmail.com',
                subject: 'PurePM Inquiry Mail',
                text: emailText,
        };

        transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                    console.log(error);
                } else {
                    console.log('Inquiry Email sent: ' + info.response);
                }
        });

    }

}