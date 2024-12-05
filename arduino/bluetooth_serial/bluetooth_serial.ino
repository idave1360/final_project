#include <SoftwareSerial.h>

int rxPin = 2;
int txPin = 3;

SoftwareSerial mySerial =  SoftwareSerial( rxPin, txPin );

void setup()  {
  pinMode( rxPin, INPUT );
  pinMode( txPin, OUTPUT );

  Serial.begin(9600);
  mySerial.begin(9600);
}

void loop() {
  if ( mySerial.available() > 0 ) {
    char c = mySerial.read();
    Serial.write(c);
  }
  if ( Serial.available() > 0 ) {
    char c = Serial.read();
    mySerial.write(c);
  }
}
