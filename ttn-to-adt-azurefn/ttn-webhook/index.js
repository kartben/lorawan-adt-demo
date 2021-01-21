const { DefaultAzureCredential } = require("@azure/identity");
const { DigitalTwinsClient } = require("@azure/digital-twins-core");

module.exports = async function (context, req) {
    const digitalTwinId = req.body.end_device_ids.device_id;
    const decodedPayload = req.body.uplink_message.decoded_payload;
    
    // - AZURE_DIGITALTWINS_URL: The tenant ID in Azure Active Directory
    const url = process.env.AZURE_DIGITALTWINS_URL;
    
    const credential = new DefaultAzureCredential();
    // DefaultAzureCredential will automatigically work in an Azure Function context if the Azure Function has
    // a system-assigned managed identity and has "Azure Digital Twins Data Owner" permission on the ADT instance
    const serviceClient = new DigitalTwinsClient(url, credential);
    
    const patches = [];

    // TODO: it might be wise to retrieve the DTDL model of the device and only patch those properties
    // that actually exist in the model, instead of all the properties found in the incoming decoded payload
    
    Object.keys(decodedPayload).forEach(key => {
        if(decodedPayload[key] != null) {
            patches.push({
                op: 'add',
                path: `/${key}`,
                value: decodedPayload[key]
            })
        }
    });
    
    context.log(`Submitting the following patches to ${digitalTwinId}: `,patches)

    const res = await serviceClient.updateDigitalTwin(digitalTwinId, patches);
    
    context.res = {
        // status: 200, /* Defaults to 200 */
        body: res
    };
}