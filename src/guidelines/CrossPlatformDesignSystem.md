# Cross-Platform Design System Guide

_Porting React/Tailwind Donation Kiosk to Native Android & iOS_

## 🎨 Design Token Translation

### Color System Translation

#### From Tailwind CSS Variables to Platform Tokens

**Web (Current Tailwind)**

```css
--primary: #030213;
--background: #ffffff;
--foreground: oklch(0.145 0 0);
--muted: #ececf0;
--border: rgba(0, 0, 0, 0.1);
```

**Android (colors.xml)**

```xml
<resources>
    <!-- Primary Colors -->
    <color name="primary">#030213</color>
    <color name="primary_foreground">#FFFFFF</color>

    <!-- Background Colors -->
    <color name="background">#FFFFFF</color>
    <color name="surface">#FFFFFF</color>
    <color name="foreground">#252525</color>

    <!-- Secondary Colors -->
    <color name="muted">#ECECF0</color>
    <color name="muted_foreground">#717182</color>

    <!-- Border & Dividers -->
    <color name="border">#1A000000</color> <!-- rgba(0,0,0,0.1) -->
    <color name="divider">#1F000000</color>

    <!-- Status Colors -->
    <color name="success">#16A34A</color>
    <color name="error">#D4183D</color>
    <color name="warning">#F59E0B</color>

    <!-- Campaign Category Colors -->
    <color name="category_health_bg">#DBEAFE</color>
    <color name="category_health_text">#1E40AF</color>
    <color name="category_education_bg">#F3E8FF</color>
    <color name="category_education_text">#7C3AED</color>
</resources>
```

**iOS (Colors.xcassets or SwiftUI)**

```swift
extension Color {
    // Primary Colors
    static let primary = Color(hex: "030213")
    static let primaryForeground = Color.white

    // Background Colors
    static let background = Color.white
    static let foreground = Color(hex: "252525")

    // Secondary Colors
    static let muted = Color(hex: "ECECF0")
    static let mutedForeground = Color(hex: "717182")

    // Border Colors
    static let border = Color.black.opacity(0.1)

    // Status Colors
    static let success = Color(hex: "16A34A")
    static let error = Color(hex: "D4183D")

    // Category Colors
    static let categoryHealthBg = Color(hex: "DBEAFE")
    static let categoryHealthText = Color(hex: "1E40AF")
}
```

### Typography System

#### From Tailwind to Platform Typography

**Android (styles.xml)**

```xml
<resources>
    <!-- Headings -->
    <style name="TextAppearance.App.Headline1">
        <item name="android:textSize">24sp</item>
        <item name="android:fontFamily">@font/inter_medium</item>
        <item name="android:lineSpacingMultiplier">1.5</item>
    </style>

    <style name="TextAppearance.App.Headline2">
        <item name="android:textSize">20sp</item>
        <item name="android:fontFamily">@font/inter_medium</item>
        <item name="android:lineSpacingMultiplier">1.5</item>
    </style>

    <!-- Body Text -->
    <style name="TextAppearance.App.Body1">
        <item name="android:textSize">16sp</item>
        <item name="android:fontFamily">@font/inter_regular</item>
        <item name="android:lineSpacingMultiplier">1.5</item>
    </style>

    <!-- Labels -->
    <style name="TextAppearance.App.Label">
        <item name="android:textSize">14sp</item>
        <item name="android:fontFamily">@font/inter_medium</item>
        <item name="android:lineSpacingMultiplier">1.5</item>
    </style>
</resources>
```

**iOS (SwiftUI)**

```swift
extension Font {
    // Headings
    static let headline1 = Font.custom("Inter-Medium", size: 24)
    static let headline2 = Font.custom("Inter-Medium", size: 20)
    static let headline3 = Font.custom("Inter-Medium", size: 18)

    // Body Text
    static let body1 = Font.custom("Inter-Regular", size: 16)
    static let body2 = Font.custom("Inter-Regular", size: 14)

    // Labels
    static let label = Font.custom("Inter-Medium", size: 14)
    static let caption = Font.custom("Inter-Regular", size: 12)
}
```

### Spacing System

#### Consistent Spacing Across Platforms

**Android (dimens.xml)**

```xml
<resources>
    <!-- Base spacing unit: 4dp -->
    <dimen name="spacing_xs">4dp</dimen>
    <dimen name="spacing_sm">8dp</dimen>
    <dimen name="spacing_md">16dp</dimen>
    <dimen name="spacing_lg">24dp</dimen>
    <dimen name="spacing_xl">32dp</dimen>
    <dimen name="spacing_2xl">48dp</dimen>

    <!-- Component specific -->
    <dimen name="card_padding">16dp</dimen>
    <dimen name="button_height">48dp</dimen>
    <dimen name="input_height">48dp</dimen>
    <dimen name="card_radius">10dp</dimen>
</resources>
```

**iOS (SwiftUI)**

```swift
struct Spacing {
    static let xs: CGFloat = 4
    static let sm: CGFloat = 8
    static let md: CGFloat = 16
    static let lg: CGFloat = 24
    static let xl: CGFloat = 32
    static let xxl: CGFloat = 48

    // Component specific
    static let cardPadding: CGFloat = 16
    static let buttonHeight: CGFloat = 48
    static let inputHeight: CGFloat = 48
    static let cardRadius: CGFloat = 10
}
```

## 📱 Platform-Specific Adaptations

### Android Material Design Adaptations

#### Navigation Patterns

```kotlin
// Bottom Navigation for main screens
class MainActivity : ComponentActivity() {
    val screens = listOf(
        Screen.Campaigns,
        Screen.Favorites,
        Screen.Profile
    )

    // Use Navigation Component with fragments
    // Follow Material Design navigation patterns
}
```

#### Button Styles (Android)

```xml
<!-- Primary Button -->
<style name="Widget.App.Button.Primary" parent="Widget.Material3.Button">
    <item name="android:background">@drawable/button_primary_background</item>
    <item name="android:textColor">@color/primary_foreground</item>
    <item name="android:minHeight">48dp</item>
    <item name="android:paddingHorizontal">24dp</item>
    <item name="cornerRadius">10dp</item>
</style>

<!-- Outlined Button -->
<style name="Widget.App.Button.Outlined" parent="Widget.Material3.Button.OutlinedButton">
    <item name="strokeColor">@color/primary</item>
    <item name="android:textColor">@color/primary</item>
</style>
```

### iOS Human Interface Guidelines Adaptations

#### Navigation Patterns (SwiftUI)

```swift
struct ContentView: View {
    @State private var selectedTab = 0

    var body: some View {
        TabView(selection: $selectedTab) {
            CampaignListView()
                .tabItem {
                    Image(systemName: "heart.fill")
                    Text("Campaigns")
                }
                .tag(0)

            FavoritesView()
                .tabItem {
                    Image(systemName: "bookmark.fill")
                    Text("Favorites")
                }
                .tag(1)
        }
        .accentColor(.primary)
    }
}
```

#### Button Styles (SwiftUI)

```swift
struct PrimaryButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .frame(maxWidth: .infinity)
            .frame(height: Spacing.buttonHeight)
            .background(Color.primary)
            .foregroundColor(Color.primaryForeground)
            .cornerRadius(Spacing.cardRadius)
            .scaleEffect(configuration.isPressed ? 0.95 : 1.0)
            .animation(.easeInOut(duration: 0.1), value: configuration.isPressed)
    }
}

struct OutlinedButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .frame(maxWidth: .infinity)
            .frame(height: Spacing.buttonHeight)
            .background(Color.clear)
            .foregroundColor(Color.primary)
            .overlay(
                RoundedRectangle(cornerRadius: Spacing.cardRadius)
                    .stroke(Color.primary, lineWidth: 1)
            )
            .scaleEffect(configuration.isPressed ? 0.95 : 1.0)
    }
}
```

## 🎯 Component Translation Guide

### Campaign Card Component

#### Android (Jetpack Compose)

```kotlin
@Composable
fun CampaignCard(
    campaign: Campaign,
    onDonate: () -> Unit,
    onViewDetails: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Column {
            // Campaign Image
            AsyncImage(
                model = campaign.image,
                contentDescription = campaign.title,
                modifier = Modifier
                    .fillMaxWidth()
                    .aspectRatio(16f / 10f),
                contentScale = ContentScale.Crop
            )

            // Content
            Column(
                modifier = Modifier.padding(Spacing.md.dp)
            ) {
                // Title and Category
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        text = campaign.title,
                        style = MaterialTheme.typography.headlineSmall,
                        modifier = Modifier.weight(1f)
                    )

                    AssistChip(
                        onClick = { },
                        label = { Text(campaign.category) },
                        colors = AssistChipDefaults.assistChipColors(
                            containerColor = MaterialTheme.colorScheme.secondaryContainer
                        )
                    )
                }

                Spacer(modifier = Modifier.height(Spacing.sm.dp))

                // Description
                Text(
                    text = campaign.description,
                    style = MaterialTheme.typography.bodyMedium,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis
                )

                Spacer(modifier = Modifier.height(Spacing.md.dp))

                // Progress
                ProgressSection(campaign = campaign)

                Spacer(modifier = Modifier.height(Spacing.md.dp))

                // Action Buttons
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(Spacing.sm.dp)
                ) {
                    Button(
                        onClick = onDonate,
                        modifier = Modifier.weight(1f)
                    ) {
                        Icon(Icons.Default.Favorite, contentDescription = null)
                        Spacer(modifier = Modifier.width(Spacing.xs.dp))
                        Text("Donate")
                    }

                    OutlinedButton(onClick = onViewDetails) {
                        Icon(Icons.Default.Info, contentDescription = "View Details")
                    }
                }
            }
        }
    }
}
```

#### iOS (SwiftUI)

```swift
struct CampaignCard: View {
    let campaign: Campaign
    let onDonate: () -> Void
    let onViewDetails: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            // Campaign Image
            AsyncImage(url: URL(string: campaign.image)) { image in
                image
                    .resizable()
                    .aspectRatio(16/10, contentMode: .fill)
            } placeholder: {
                Rectangle()
                    .fill(Color.muted)
                    .aspectRatio(16/10, contentMode: .fill)
            }
            .clipped()
            .overlay(alignment: .topLeading) {
                Text(campaign.category)
                    .font(.caption)
                    .padding(.horizontal, Spacing.sm)
                    .padding(.vertical, Spacing.xs)
                    .background(Color.categoryHealthBg)
                    .foregroundColor(Color.categoryHealthText)
                    .cornerRadius(Spacing.xs)
                    .padding(Spacing.sm)
            }

            // Content
            VStack(alignment: .leading, spacing: Spacing.sm) {
                // Title
                Text(campaign.title)
                    .font(.headline2)
                    .lineLimit(1)

                // Description
                Text(campaign.description)
                    .font(.body1)
                    .foregroundColor(Color.mutedForeground)
                    .lineLimit(2)

                // Progress Section
                ProgressSection(campaign: campaign)

                // Action Buttons
                HStack(spacing: Spacing.sm) {
                    Button(action: onDonate) {
                        HStack {
                            Image(systemName: "heart.fill")
                            Text("Donate")
                        }
                        .frame(maxWidth: .infinity)
                    }
                    .buttonStyle(PrimaryButtonStyle())

                    Button(action: onViewDetails) {
                        Image(systemName: "info.circle")
                    }
                    .buttonStyle(OutlinedButtonStyle())
                    .frame(width: Spacing.buttonHeight)
                }
            }
            .padding(Spacing.md)
        }
        .background(Color.background)
        .cornerRadius(Spacing.cardRadius)
        .shadow(color: Color.border, radius: 2, x: 0, y: 1)
    }
}
```

## 🔄 State Management Translation

### From React State to Platform State

#### Android (Jetpack Compose + ViewModel)

```kotlin
class CampaignViewModel : ViewModel() {
    private val _currentScreen = mutableStateOf(Screen.Login)
    val currentScreen: State<Screen> = _currentScreen

    private val _selectedCampaign = mutableStateOf<Campaign?>(null)
    val selectedCampaign: State<Campaign?> = _selectedCampaign

    fun navigate(screen: Screen) {
        _currentScreen.value = screen
    }

    fun selectCampaign(campaign: Campaign) {
        _selectedCampaign.value = campaign
        navigate(Screen.DonationSelection)
    }
}
```

#### iOS (SwiftUI + ObservableObject)

```swift
class AppState: ObservableObject {
    @Published var currentScreen: Screen = .login
    @Published var selectedCampaign: Campaign?
    @Published var donation: Donation?
    @Published var paymentResult: PaymentResult?

    func navigate(to screen: Screen) {
        currentScreen = screen
    }

    func selectCampaign(_ campaign: Campaign) {
        selectedCampaign = campaign
        navigate(to: .donationSelection)
    }

    func handleLogin() {
        navigate(to: .campaigns)
    }
}
```

## 📐 Layout Guidelines

### Responsive Design Patterns

#### Android Layout Guidelines

```xml
<!-- Use ConstraintLayout for complex layouts -->
<!-- Follow Material Design spacing guidelines -->
<!-- Use different layouts for phone/tablet -->

<!-- res/layout/activity_main.xml (Phone) -->
<!-- res/layout-sw600dp/activity_main.xml (Tablet) -->
```

#### iOS Layout Guidelines

```swift
// Use SwiftUI's adaptive layouts
GeometryReader { geometry in
    if geometry.size.width > 600 {
        // Tablet layout
        HStack {
            CampaignListView()
            CampaignDetailView()
        }
    } else {
        // Phone layout
        NavigationView {
            CampaignListView()
        }
    }
}
```

## 🎯 Implementation Strategy

### Phase 1: Design System Foundation

1. **Create Design Tokens**: Convert all Tailwind variables to platform-specific tokens
2. **Build Core Components**: Button, Card, Input, Progress, etc.
3. **Setup Typography**: Custom fonts and text styles
4. **Color System**: Light/dark mode support

### Phase 2: Screen Implementation

1. **Login Screen**: Start with simplest screen
2. **Campaign List**: Implement list patterns
3. **Details & Forms**: Complex layouts and interactions
4. **Payment Flow**: Secure input handling

### Phase 3: Platform Optimization

1. **Android**: Material Design 3 compliance
2. **iOS**: Human Interface Guidelines compliance
3. **Performance**: Optimize images, animations
4. **Accessibility**: Screen readers, voice control

### Phase 4: Testing & Refinement

1. **Cross-platform consistency**: Visual regression testing
2. **User testing**: Platform-specific usability
3. **Performance testing**: Memory, battery usage
4. **Accessibility testing**: Platform accessibility tools

## 🛠 Development Tools

### Android

- **Jetpack Compose**: Modern UI toolkit
- **Material Design Components**: Pre-built components
- **Compose Preview**: Design-time previews
- **Design System**: Material Theme Builder

### iOS

- **SwiftUI**: Declarative UI framework
- **SF Symbols**: System iconography
- **Xcode Previews**: Design-time previews
- **Design System**: Human Interface Guidelines

### Cross-Platform Testing

- **Figma**: Design consistency verification
- **Percy/Chromatic**: Visual regression testing
- **Device farms**: Real device testing
- **Accessibility scanners**: Platform-specific tools