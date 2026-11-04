# Master Prompt cho Antigravity: Xây dựng Nền tảng Văn Phòng Ảo Nhập Vai Nhân Vật 3D Tự Do Sắp Xếp Chỗ Ngồi (ReactJS + Three.js + Tailwind CSS)

Bạn có thể sao chép toàn bộ nội dung Prompt dưới đây (hoặc phần Prompt Copy-Paste Nhanh ở mục 5) và dán trực tiếp vào **Antigravity** để AI Agent tự động khởi tạo kiến trúc, viết code và hoàn thiện toàn bộ dự án.

## 1. Prompt Tổng Thể (System & Product Specification Prompt)

> **Vai trò (Role):** Bạn là một Senior Full-Stack & 3D WebGL/WebRTC Engineer chuyên về ReactJS, Tailwind CSS, Three.js (`@react-three/fiber`, `@react-three/drei`) và WebRTC.
>
> **Mục tiêu dự án (Project Goal):** Xây dựng một ứng dụng web **Văn Phòng Làm Việc Ảo Nhập Vai Nhân Vật 3D (3D RPG Collaborative Virtual Office)** sử dụng **ReactJS (TypeScript/JSX) + Three.js + Tailwind CSS**. Không phân quyền Admin — mọi người dùng đều bình đẳng. Khi vừa truy cập, người dùng sẽ bước vào một **không gian sàn văn phòng 3D trống trải**, nơi mỗi người tự do chọn vị trí và **tự tay lắp đặt, sắp xếp bàn làm việc, ghế xoay, dàn PC, cây cảnh cho góc làm việc của riêng mình**. Người dùng hóa thân thành **nhân vật 3D có cơ thể và khớp chuyển động đầy đủ theo phong cách game nhập vai (RPG)**, tự do đi lại qua các góc làm việc của nhau, chuyển đổi mượt mà giữa **Góc nhìn thứ 3 (3rd-Person RPG)** và **Góc nhìn thứ nhất (1st-Person POV)**, click ngồi vào bàn làm việc và bật **chia sẻ màn hình máy tính "Chỉ Xem" (View-Only kiểu UltraViewer)** hiển thị qua cửa sổ Popup thu nhỏ.

## 2. Chi Tiết Các Yêu Cầu Chức Năng Cốt Lõi (Core Functional Requirements)

| Phân hệ chức năng | Mô tả chi tiết yêu cầu kỹ thuật & trải nghiệm người dùng |
| :--- | :--- |
| **1. Không gian trống ban đầu & Tự do sắp xếp chỗ ngồi cho mọi User (Open Sandbox Builder)** | • **Không phân quyền Admin:** Bỏ hoàn toàn cơ chế khóa quyền Admin. Mọi người dùng vào phòng đều có toàn quyền truy cập thanh công cụ **Tự Thiết Kế Góc Làm Việc (Personal Desk & Space Builder)**.<br>• **Khởi đầu là không gian trống (Blank Canvas Floor):** Khi mới tạo phòng (hoặc khi người dùng mới bước vào vùng sàn trống), mặt bằng là một sàn lưới 3D mở, thoáng đãng.<br>• **Tự lắp đặt bàn ghế & PC cá nhân:** Mỗi user tự chọn ô đất trống trên sàn để đặt **Trạm làm việc trọn bộ (Combo Bàn + Ghế + PC)** hoặc tự ghép từng món lẻ (Bàn chữ L/Bàn thẳng, Ghế công thái học, Dàn PC 1-2-3 màn hình, Laptop, Vách ngăn lửng, Cây xanh, Đèn bàn, Tủ cá nhân, Sofa, Máy pha cà phê), xoay hướng 4 chiều (`Phím R`) và di dời bất cứ lúc nào.<br>• **Định danh chủ sở hữu chỗ ngồi (`ownerId`):** Bàn ghế và PC do user nào đặt sẽ tự động gắn thẻ tên của user đó, giúp mọi người biết góc làm việc này thuộc về ai. |
| **2. Nhân vật 3D dạng nhập vai (3D RPG Humanoid Character)** | Mỗi người dùng là một **nhân vật 3D hoàn chỉnh** có đầy đủ đầu, tóc, khuôn mặt, thân áo, 2 cánh tay, bàn tay, 2 chân, giày và phụ kiện (tai nghe/balo) có khớp xương (`Humanoid Rig / Articulated 3D Mesh`):<br>• **Điều khiển nhập vai (RPG Controls):** Di chuyển bằng `WASD`/Mũi tên kết hợp xoay chuột hoặc Click-to-Move trên sàn 3D. Nhân vật tự động xoay mặt mượt mà (`Quaternion/Angle Lerp`) theo hướng bước đi.<br>• **Hoạt ảnh 3D thời gian thực (`Animation State Machine`):** Có đủ các trạng thái `Idle` (đứng thở nhẹ, nhìn quanh), `Walk / Run` (vung tay, sải chân 3D theo tốc độ), và `Sit & Type` (gập khớp hông và gối ngồi lên ghế xoay 3D vừa đặt, đặt 2 tay lên bàn phím 3D và gõ liên tục).<br>• **Tùy biến nhân vật (RPG Avatar Customizer):** Đổi kiểu tóc, màu áo/hoodie, màu quần, phụ kiện và thẻ tên 3D (`3D Floating Nameplate`) lơ lửng trên đầu. |
| **3. Hệ thống 2 Góc Nhìn 3D (3rd-Person RPG & 1st-Person POV)** | Người dùng chuyển đổi tức thì (qua nút bấm UI hoặc phím tắt `V`) giữa 2 góc nhìn:<br>• **Góc nhìn thứ 3 nhập vai (3rd-Person RPG View):** Camera đặt phía sau lưng chếch lên trên nhân vật (`Third-Person Follow/Orbit Camera` có hỗ trợ kéo chuột xoay 360° và cuộn chuột Zoom) để dễ dàng vừa đi dạo vừa sắp xếp bàn ghế, thấy rõ cơ thể 3D của mình và đồng nghiệp xung quanh.<br>• **Góc nhìn thứ nhất (1st-Person POV View):** Đặt `PerspectiveCamera` ngay tại vị trí tầm mắt (`Head Bone / Eye Level`) của nhân vật 3D. Khi đi bộ, người dùng nhìn trực tiếp không gian trước mặt; khi ngồi vào chiếc ghế mình vừa sắp xếp, người dùng nhìn thẳng vào dàn màn hình PC 3D trên mặt bàn của mình và có thể xoay đầu nhìn sang góc bàn làm việc của các đồng nghiệp bên cạnh. |
| **4. Tương tác Ngồi Bàn 3D & Xem Màn Hình Popup (View-Only UltraViewer)** | • **Click để ngồi:** Sau khi tự đặt bàn ghế và PC (hoặc khi click vào ghế của mình), nhân vật 3D tự động bước tới (A*/BFS Pathfinding né vật cản) và ngồi vào ghế xoay.<br>• **Cấp quyền chia sẻ màn hình:** Ngay khi ngồi vào bàn có đặt máy tính (PC/Laptop), hiển thị hộp thoại hỏi người dùng có cho phép bật **Chia sẻ màn hình máy tính (Chế độ Chỉ Xem - View Only)** qua `navigator.mediaDevices.getDisplayMedia()` (kèm chế độ màn hình IDE/Figma mô phỏng dự phòng).<br>• **Hiển thị trên màn hình PC 3D & Popup nổi:** Khi bật chia sẻ, chiếc màn hình PC 3D trên bàn sẽ phát sáng và hiển thị trực tiếp hình ảnh màn hình (qua `VideoTexture` / `CanvasTexture`). Người dùng khác đi ngang qua hoặc click vào nhân vật 3D / màn hình PC 3D đó sẽ mở một **Popup thu nhỏ nổi trên giao diện (Floating PiP Modal)** để xem rõ họ đang làm gì mà không có quyền điều khiển chuột/bàn phím từ xa. |

## 3. Đặc Tả Kiến Trúc Kỹ Thuật 3D & Trạng Thái (3D Architecture & State Design)

### 3.1. Cơ chế Không Gian Trống & Tự Sắp Xếp Nội Thất 3D (`CollaborativeSpaceManager`)
* **Trạng thái khởi tạo (`Initial Empty Floor`)**:
  * Khởi tạo mặt sàn văn phòng 3D kích thước rộng (ví dụ: `24x16` ô lưới 3D) hoàn toàn trống để người dùng tự do sáng tạo bố cục (kèm một tùy chọn nhỏ *"Thêm đồng nghiệp mẫu đang tự xếp bàn"* nếu người dùng muốn test nhanh tính năng xem màn hình của người khác).
* **Chế độ Đặt & Sắp Xếp Đồ Đạc (`Placement & Edit Mode` cho mọi User)**:
  * Thanh Dock dưới đáy màn hình luôn hiển thị các nhóm vật phẩm 3D để mọi user lấy ra đặt bất kỳ lúc nào:
    1. **Combo Góc Làm Việc Nhanh (1-Click Setup)**: Đặt ngay 1 bộ gồm Bàn + Ghế xoay + Dàn PC 2 màn hình vào ô được chọn.
    2. **Rời từng món (Modular Items)**: Bàn gỗ/Bàn nâng hạ (`Desk`), Ghế xoay công thái học (`Chair`), Màn hình đơn/kép + Thùng PC (`PC Rig`), Vách ngăn riêng tư (`Partition Wall`), Chậu cây (`Plant`), Kệ sách (`Bookshelf`), Sofa & Máy pha cà phê (`Lounge Items`).
  * Hỗ trợ **Ghost Preview 3D** (hình bóng bán trong suốt màu xanh lá khi ô hợp lệ, màu đỏ khi trùng vị trí) đi theo con trỏ chuột trên mặt sàn 3D, nhấn `R` để xoay hướng (`0°`, `90°`, `180°`, `270°`), Click trái để đặt, hoặc Click vào đồ vật đã đặt để **Di chuyển (Move) / Xoay (Rotate) / Thu hồi (Remove)**.
  * Tự động ghép nối thông minh (`Smart Snapping`): Nếu user đặt riêng một chiếc **Bàn**, sau đó đặt **Dàn PC** vào cùng ô bàn đó thì dàn PC tự động nằm gọn trên mặt bàn; đặt **Ghế** ngay sát trước bàn thì ghế tự động liên kết với màn hình PC trên bàn đó để kích hoạt tính năng ngồi làm việc và chia sẻ màn hình.

### 3.2. Cấu trúc Khớp Xương Nhân Vật 3D Nhập Vai (`HumanoidCharacter3D`)
Thiết kế mỗi nhân vật là một cây phân cấp `THREE.Group` gồm các bộ phận có tâm xoay (`Pivot Point`) tại khớp:
* `CharacterRoot` (tọa độ `x, y, z` trên sàn và góc quay hướng mặt `rotation.y`)
  * `Pelvis / TorsoGroup` (Thân áo công sở / Hoodie)
    * `HeadGroup` (Đầu, khuôn mặt có 2 mắt, kiểu tóc 3D, tai nghe, và `CameraMountPoint` cho góc nhìn thứ nhất)
    * `LeftShoulderPivot` -> `LeftArmMesh` (Cánh tay trái + bàn tay)
    * `RightShoulderPivot` -> `RightArmMesh` (Cánh tay phải + bàn tay)
  * `LeftHipPivot` -> `LeftLegMesh` (Chân trái + giày)
  * `RightHipPivot` -> `RightLegMesh` (Chân phải + giày)
  * `BillboardNameTag` (Thẻ tên + trạng thái `LIVE SCREEN` luôn hướng về phía Camera)

Công thức hoạt ảnh trong vòng lặp render (`useFrame` / `requestAnimationFrame`):
* **Khi đi bộ (`state === 'walking'`)**:
  * `LeftHipPivot.rotation.x = Math.sin(time * 10) * 0.6`
  * `RightHipPivot.rotation.x = -Math.sin(time * 10) * 0.6`
  * `LeftShoulderPivot.rotation.x = -Math.sin(time * 10) * 0.5`
  * `RightShoulderPivot.rotation.x = Math.sin(time * 10) * 0.5`
* **Khi ngồi bàn làm việc (`state === 'sitting'`)**:
  * Hạ thấp `TorsoGroup.position.y`, xoay `LeftHipPivot.rotation.x = -Math.PI / 2` và `RightHipPivot.rotation.x = -Math.PI / 2` để đùi song song mặt ghế.
  * Đưa 2 tay về phía trước (`LeftShoulderPivot.rotation.x = -0.9`) và dao động nhẹ (`Math.sin(time * 18) * 0.08`) mô phỏng động tác gõ bàn phím máy tính.

### 3.3. Cơ chế Camera Kép (3rd-Person RPG Follow & 1st-Person POV)
1. **Góc nhìn thứ 3 nhập vai (`cameraMode === 'third_person'`)**:
   * Camera bám mượt (`Vector3.lerp`) theo vị trí phía sau nhân vật ở khoảng cách cấu hình được, cho phép người dùng kéo chuột để xoay góc nhìn 360° quanh nhân vật và cuộn chuột để Zoom xa/gần (rất thuận tiện khi đang tự sắp xếp bàn ghế PC hoặc đi bộ sang bàn người khác).
2. **Góc nhìn thứ nhất (`cameraMode === 'first_person'`)**:
   * Ẩn phần `HeadGroup` của nhân vật người chơi (để không che tầm nhìn) và gắn vị trí Camera trùng khít với mắt nhân vật (`x, y = eyeHeight, z`), hướng nhìn `lookAt` phóng về phía trước theo góc xoay của nhân vật (cho phép di chuột để ngoái đầu nhìn quanh bàn làm việc vừa tự sắp xếp và nhìn sang màn hình của đồng nghiệp).

### 3.4. Hệ thống Chia Sẻ Màn Hình "Chỉ Xem" & Popup Nổi (`FloatingScreenViewer`)
* Khi người dùng ngồi vào chiếc ghế trước bàn máy tính 3D của mình và bật chia sẻ màn hình:
  * Luồng video từ `navigator.mediaDevices.getDisplayMedia()` (hoặc Canvas mô phỏng) vừa được ánh xạ lên mặt phẳng màn hình PC 3D trên bàn (`THREE.VideoTexture` / `THREE.CanvasTexture`), vừa sẵn sàng phát lên cửa sổ Popup 2D.
* Khi người khác click vào nhân vật đang ngồi hoặc click vào màn hình PC 3D của họ:
  * Mở một **Popup nổi bằng Tailwind CSS** ngay trên giao diện với nhãn bảo mật rõ ràng: **`CHẾ ĐỘ CHỈ XEM (VIEW-ONLY ULTRAVIEW) • ĐÃ KHÓA ĐIỀU KHIỂN CHUỘT & BÀN PHÍM`**.
  * Hỗ trợ đầy đủ thao tác: **Thu nhỏ (Minimize)**, **Phóng to (Maximize)**, **Đổi góc neo Popup**, **Zoom In/Out (`80%` - `150%`)**, và gửi phản hồi/tin nhắn nhanh tại bàn.

## 4. Lộ Trình Thực Thi Từng Bước Dành Cho Antigravity (Step-by-Step Implementation Plan)

Khi thực hiện trong Antigravity, hãy yêu cầu Agent triển khai lần lượt theo 4 bước sau:

1. **Bước 1 — Khởi tạo Không gian Sàn 3D Trống & Nhân Vật 3D Nhập Vai (`HumanoidCharacter3D`)**:
   * Khởi tạo dự án React + Tailwind CSS + Three.js (`three` / `@react-three/fiber` / `@react-three/drei`) + `lucide-react`.
   * Dựng mặt sàn 3D trống có lưới ô định vị và mô hình nhân vật 3D có khớp tay, chân, đầu, thân áo với 3 hoạt ảnh: `Idle`, `Walk` (xoay người theo hướng đi), và `Sit & Type` (ngồi ghế gõ bàn phím).
2. **Bước 2 — Xây dựng Thanh Công Cụ Tự Sắp Xếp Bàn Ghế & PC Cho Mọi User**:
   * Tạo thanh Dock công cụ nổi cho phép mọi user tự chọn và đặt Bàn làm việc, Ghế xoay, Dàn PC (1-2 màn hình), Vách ngăn, Cây cảnh trực tiếp lên sàn 3D trống (hỗ trợ Ghost Preview 3D, phím `R` để xoay hướng, di dời hoặc xóa đồ đã đặt, và tự động đặt PC lên mặt bàn).
   * Bổ sung nút *"Gợi ý thêm vài đồng nghiệp mẫu vào phòng"* để người dùng có thể lập tức thử nghiệm việc đi sang bàn của người khác và xem màn hình của họ.
3. **Bước 3 — Xây dựng Điều Khiển Nhập Vai & Chuyển Đổi 2 Góc Nhìn (3rd-Person / 1st-Person POV)**:
   * Lập trình điều khiển di chuyển bằng `WASD`/Mũi tên và Click-to-Move trên mặt sàn 3D (có thuật toán tìm đường BFS né các bàn ghế/vách ngăn đã đặt).
   * Tích hợp bộ chuyển đổi Camera mượt mà giữa **Góc nhìn thứ 3 nhập vai** (Follow/Orbit sau lưng nhân vật) và **Góc nhìn thứ nhất (1st-Person POV)** (nhìn từ mắt nhân vật ra dàn PC trên bàn mình vừa xếp và không gian xung quanh, kèm Minimap 2D ở góc).
4. **Bước 4 — Tích hợp Ngồi Bàn 3D, Chia Sẻ Màn Hình "Chỉ Xem" (`getDisplayMedia`) & Popup Nổi**:
   * Bắt sự kiện click vào ghế/bàn làm việc 3D để nhân vật đi tới ngồi vào ghế và mở hộp thoại hỏi cấp quyền chia sẻ màn hình.
   * Ánh xạ màn hình đang chia sẻ lên chiếc màn hình 3D trên bàn và hoàn thiện cửa sổ **Popup Xem Màn Hình Thu Nhỏ (View-Only)** khi người dùng khác click vào xem.

## 5. Prompt Copy-Paste Nhanh (Dùng để dán trực tiếp vào ô Chat của Antigravity)

```text
Hãy xây dựng cho tôi một ứng dụng web "Văn Phòng Làm Việc Ảo Nhập Vai Nhân Vật 3D" hoàn chỉnh bằng ReactJS (TypeScript/JSX), Three.js (hoặc @react-three/fiber), Tailwind CSS và lucide-react với các yêu cầu cốt lõi sau:

1. KHÔNG GIAN TRỐNG BAN ĐẦU & MỌI USER TỰ SẮP XẾP CHỖ NGỒI, BÀN GHẾ, PC (KHÔNG PHÂN QUYỀN ADMIN):
- Không sử dụng quyền Admin: mọi người dùng truy cập vào văn phòng đều bình đẳng và có toàn quyền tự tạo, sắp xếp góc làm việc của mình.
- Khi vừa vào ứng dụng, mặt bằng văn phòng là một không gian sàn 3D trống trải (có chia lưới ô vuông tinh tế).
- Cung cấp thanh công cụ trực quan (Furniture & PC Dock) cho phép mọi user tự lấy và đặt lên sàn trống:
  + Đặt lẻ từng món hoặc đặt theo Combo: Bàn làm việc, Ghế xoay văn phòng, Dàn máy tính PC (1 hoặc 2 màn hình — nếu đặt lên ô có bàn thì PC tự động nằm ngay ngắn trên mặt bàn), Vách ngăn phòng, Cửa, Cây xanh, Sofa, Quầy cà phê.
  + Cho phép xoay hướng 4 chiều (phím R), di chuyển lại vị trí hoặc xóa bàn ghế/PC đã đặt bất cứ lúc nào, kèm hiển thị tên chủ sở hữu trên góc bàn.
  + Có thêm nút "Triệu hồi đồng nghiệp mẫu" để tự động sinh thêm 3 đồng nghiệp 3D tự dựng bàn ghế và ngồi làm việc gần đó nhằm dễ dàng test tính năng xem màn hình.

2. NHÂN VẬT 3D DẠNG NHẬP VAI (3D RPG HUMANOID CHARACTER):
- Mỗi người dùng trong văn phòng là một nhân vật 3D có cơ thể đầy đủ (đầu, tóc, mắt, thân áo, 2 cánh tay, 2 chân có khớp chuyển động 3D rõ ràng).
- Điều khiển dạng game nhập vai (RPG): Di chuyển mượt mà trong không gian bằng phím WASD/Mũi tên hoặc Click chuột lên sàn 3D (tự động tìm đường BFS né các bàn ghế/vách ngăn đã đặt, thân nhân vật xoay mượt theo hướng di chuyển).
- Có hoạt ảnh 3D (Animation) cho 3 trạng thái: Đứng nghỉ (Idle), Bước đi vung tay chân (Walking), và Ngồi vào ghế xoay gõ bàn phím trước máy tính (Sitting & Typing).

3. HỆ THỐNG 2 GÓC NHÌN NHẬP VAI (GÓC NHÌN THỨ 3 & GÓC NHÌN THỨ NHẤT - POV):
- Cho phép người dùng chuyển đổi tức thì (bằng nút bấm hoặc phím V) giữa 2 chế độ:
  + Góc nhìn thứ 3 (3rd-Person RPG View): Camera đi theo sau lưng nhân vật (Follow/Orbit Camera có thể kéo chuột xoay góc nhìn 360 độ và cuộn chuột zoom xa/gần) giúp dễ dàng vừa đi lại vừa sắp xếp bàn ghế, PC.
  + Góc nhìn thứ nhất (1st-Person POV View): Đặt Camera ngay tại tầm mắt của nhân vật 3D. Khi đi bộ thì nhìn dọc không gian văn phòng 3D; khi ngồi vào chiếc ghế mình vừa sắp xếp thì nhìn trực diện vào dàn màn hình PC 3D trước mặt, thấy bàn phím và có thể xoay góc nhìn quanh bàn để nhìn thấy các đồng nghiệp 3D ở các bàn lân cận (kèm Minimap 2D ở góc màn hình).

4. CLICK NGỒI BÀN LÀM VIỆC & POPUP XEM MÀN HÌNH "CHỈ XEM" (KIỂU ULTRAVIEWER VIEW-ONLY):
- Khi người dùng click vào chiếc ghế/bàn làm việc 3D mà mình (hoặc người khác) đã đặt trên sàn, nhân vật 3D tự động bước tới ngồi vào ghế. Nếu trên bàn có đặt máy tính (PC/Laptop), hiển thị hộp thoại hỏi cấp quyền "Cho phép xem màn hình máy tính" (hỗ trợ cả gọi API thật navigator.mediaDevices.getDisplayMedia() lẫn chế độ màn hình làm việc IDE/Figma mô phỏng).
- Khi một người đang bật chia sẻ màn hình, màn hình máy tính 3D trên bàn của họ phát sáng (hiển thị nội dung live trực tiếp trên mặt màn hình 3D) kèm nhãn LIVE trên đầu nhân vật.
- Khi người dùng khác click vào nhân vật 3D đó hoặc màn hình PC 3D trên bàn của họ (ở cả góc nhìn thứ 3 lẫn góc nhìn thứ 1), hệ thống mở một cửa sổ Popup nhỏ nổi trên màn hình (Floating Picture-in-Picture bằng Tailwind CSS) hiển thị trực tiếp màn hình máy tính của họ ở chế độ CHỈ XEM (View-Only, khóa hoàn toàn điều khiển chuột/phím từ xa), hỗ trợ thu nhỏ, phóng to, đổi góc đặt popup, zoom và gửi biểu cảm/tin nhắn nhanh tại bàn.
```
