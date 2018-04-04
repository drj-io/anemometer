from Adafruit_LED_Backpack import SevenSegment
import sys


print(sys.argv[1])

segment = SevenSegment.SevenSegment(address=0x70)
segment.begin()
segment.clear()

segment.set_digit(0, sys.argv[1][0])
segment.set_digit(1, sys.argv[1][1])
segment.set_digit(2, sys.argv[1][2])
segment.set_digit(3, sys.argv[1][3])

segment.set_colon(3)
segment.write_display()
