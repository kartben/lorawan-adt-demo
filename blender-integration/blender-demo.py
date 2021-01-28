from azure.identity import DefaultAzureCredential
from azure.core.exceptions import HttpResponseError
from azure.digitaltwins.core import DigitalTwinsClient
import bpy

ADT_ENDPOINT_URI = '<REPLACE_WITH_YOUR_ADT_ENDPOINT_URI>'
BUILDING_TWIN_ID = '<REPLACE_WITH_YOUR_BUILDING_TWIN_ID' 

credentials = DefaultAzureCredential()

service_client = DigitalTwinsClient(ADT_ENDPOINT_URI, credentials, logging_enable=False)

# List the IDs + temperature of the sensor for all rooms in building `buildingId` that contain a sensor of type Dragino LHT65
query_expression = """SELECT Room.$dtId, Sensor.temperature 
                      FROM DIGITALTWINS Building 
                      JOIN Room RELATED Building.contains 
                      JOIN Sensor RELATED Room.contains 
                      WHERE IS_OF_MODEL(Sensor, 'dtmi:com:dragino:lht65;2')
                      AND IS_OF_MODEL(Room, 'dtmi:example:Room;1')
                      AND IS_PRIMITIVE(Sensor.temperature) 
                      AND IS_PRIMITIVE(Room.$dtId) 
                      AND Building.$dtId = '%s'""" % BUILDING_TWIN_ID

def update_3d_model_callback():
    # clear all labels
    for label in bpy.data.collections['Labels'].objects:
        label.data.body = ''
    
    query_result = service_client.query_twins(query_expression)
    for item in query_result:
        roomId = item['$dtId']
        roomLabel = roomId + '_label'
        roomTemperature = item['temperature']
        if roomLabel in bpy.data.objects:
            bpy.data.objects[roomLabel].data.body = str(roomTemperature)
    return 5 # call function every 5s

bpy.app.timers.register(update_3d_model_callback)   