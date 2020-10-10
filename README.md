# eAMEMu_RN
HCE-F를 이용한 안드로이드 전용 e-AMUSEMENT PASS 에뮬레이션 앱 (with React Native)

[미리 빌드 된 APK](app-release.apk) 을 다운 받고 설치해주세요.

## 이용 전 주의 사항

**해외 제조사 기기, 커스텀 롬 기기에서는 동작하지 않을 확률이 높습니다.**<br>
**NFC 안테나 부분 (일반적으로 기기 후면) 을 완전히 덮는 플라스틱 케이스 사용 시 인식률이 매우 저하될 수 있습니다.**

1. 앱을 실행하기 위해서는 안드로이드 8.0 이상의 NFC가 탑재된 기기가 필요합니다. 또한 기기마다 호환성이 다른 기능(HCE-F)을 필요로 합니다. NFC를 탑재하고 있더라도 카드를 에뮬레이션 하지 못할 수 있습니다.
2. 이 앱을 이용할 때는 NFC를 활성화하고 다른 카드 에뮬레이션을 사용하는 앱(모바일 티머니 등) 을 종료한 상태로 이용하는 것을 권장합니다. 또한 일부 기기에 존재하는 기본 NFC 설정을 안드로이드 운영체제 또는 자동 선택으로 설정해주세요.
3. SID는 이어뮤 카드 번호와 일치하지 않음에 유의하세요. 카드 번호는 미리 보기 또는 홈에서 '터치하여 활성화 / 비활성화' 위에 표시됩니다.
4. SID는 직접 입력할 수 없고 랜덤으로만 생성이 가능합니다. 정말 운이 좋아 랜덤으로 생성된 카드가 이미 사용중일 수도 있으니 그 때는 SID를 다시 랜덤으로 변경하면 됩니다.

## 정상작동이 확인된 기기
* Galaxy Note 8 (SM-N950N), Android 9
* Galaxy Note 9 (SM-N960N), Unknown
* LG V30 (LGM-V300L), Android 9
* Galaxy S10 5G (SM-G977N), Android 10

## 테스트 시 작동되지 않은 기기
**이 목록은 단순히 참고용으로 적어놓은 것으로, 실행환경에 따라 아래 목록에 있더라도 정상 동작할 수 있습니다**

* XPERIA XZ2 Compact, Android 9
* Mi Note 3, Android 9
* Galaxy S20+ BTS, SKT향 Android 10

### Special Thanks for 
* [@dogelition_man](https://github.com/ledoge) (provide source that convert sid to card number)
