function decodeUplink(input) {
    var data = {};
    var bytes = input.bytes;
    
    switch (input.fPort) {
      case 2:
        data = {
           $metadata: {
             $model: 'dtmi:com:dragino:lht65;2'
           },
           
           //Battery,units:V
           batteryLevel: ((bytes[0]<<8 | bytes[1]) & 0x3FFF)/1000,
           
           //SHT20,temperature,units:C
           builtInTemperature:((bytes[2]<<24>>16 | bytes[3])/100),
           
           //SHT20,Humidity,units:%
           builtInHumidity:((bytes[4]<<8 | bytes[5])/10),
           
           //DS18B20,temperature,units:C
           temperature:
           {
             "1":((bytes[7]<<24>>16 | bytes[8])/100),
           }[bytes[6]&0xFF],       
           
        }
      break;
    }  
    
    return {
      data: data
    };
  }
  