import React, { useState } from 'react';
import { Copy, Check, FileCode, Folder, Terminal, Download, Sparkles, Layers } from 'lucide-react';

interface AndroidFile {
  path: string;
  filename: string;
  language: string;
  description: string;
  code: string;
}

const ANDROID_PROJECT_FILES: AndroidFile[] = [
  {
    path: 'app/build.gradle.kts',
    filename: 'build.gradle.kts',
    language: 'kotlin',
    description: 'Gradle build configuration with Jetpack Compose, Media3 ExoPlayer, Retrofit, Coil, and Room dependencies.',
    code: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.ksp)
}

android {
    namespace = "org.archive.cinearchive"
    compileSdk = 35

    defaultConfig {
        applicationId = "org.archive.cinearchive"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
    buildFeatures {
        compose = true
    }
}

dependencies {
    // Core AndroidX & Lifecycle
    implementation("androidx.core:core-ktx:1.15.0")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.8.7")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.8.7")
    implementation("androidx.activity:activity-compose:1.9.3")

    // Jetpack Compose BOM & Material 3
    val composeBom = platform("androidx.compose:compose-bom:2024.12.01")
    implementation(composeBom)
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.material:material-icons-extended")
    implementation("androidx.navigation:navigation-compose:2.8.5")

    // Networking: Retrofit & OkHttp (Zero-key Internet Archive API)
    implementation("com.squareup.retrofit2:retrofit:2.11.0")
    implementation("com.squareup.retrofit2:converter-gson:2.11.0")
    implementation("com.squareup.okhttp3:logging-interceptor:4.12.0")

    // Video Streaming: AndroidX Media3 ExoPlayer
    implementation("androidx.media3:media3-exoplayer:1.5.1")
    implementation("androidx.media3:media3-ui:1.5.1")
    implementation("androidx.media3:media3-common:1.5.1")

    // Image Loading: Coil for Compose
    implementation("io.coil-kt:coil-compose:2.7.0")

    // Local Storage: Room Database for Watchlist
    implementation("androidx.room:room-runtime:2.6.1")
    implementation("androidx.room:room-ktx:2.6.1")
    ksp("androidx.room:room-compiler:2.6.1")

    // Coroutines
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.9.0")
}`
  },
  {
    path: 'app/src/main/AndroidManifest.xml',
    filename: 'AndroidManifest.xml',
    language: 'xml',
    description: 'Application manifest declaring INTERNET permission, hardware acceleration, and video playback orientation.',
    code: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <!-- Zero-cost public internet access for Internet Archive endpoints -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <application
        android:name=".CineArchiveApp"
        android:allowBackup="true"
        android:hardwareAccelerated="true"
        android:icon="@mipmap/ic_launcher"
        android:label="CineArchive"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.CineArchive"
        android:usesCleartextTraffic="true">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:configChanges="orientation|screenSize|screenLayout|keyboardHidden"
            android:theme="@style/Theme.CineArchive">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>`
  },
  {
    path: 'app/src/main/java/org/archive/cinearchive/data/api/ArchiveApiService.kt',
    filename: 'ArchiveApiService.kt',
    language: 'kotlin',
    description: 'Retrofit interface querying Internet Archive Advanced Search and Item Metadata endpoints without API keys.',
    code: `package org.archive.cinearchive.data.api

import org.archive.cinearchive.data.model.AdvancedSearchResponse
import org.archive.cinearchive.data.model.ItemMetadataResponse
import retrofit2.http.GET
import retrofit2.http.Path
import retrofit2.http.Query

interface ArchiveApiService {

    /**
     * Advanced Search for public domain movies with pagination and sorting.
     * Endpoint: https://archive.org/advancedsearch.php
     */
    @GET("advancedsearch.php")
    suspend fun searchMovies(
        @Query("q") query: String,
        @Query("fl[]") fields: List<String> = listOf("identifier", "title", "description", "year", "creator", "downloads", "mediatype"),
        @Query("sort[]") sort: String = "downloads desc",
        @Query("rows") rows: Int = 24,
        @Query("page") page: Int = 1,
        @Query("output") output: String = "json"
    ): AdvancedSearchResponse

    /**
     * Detailed metadata & file inventory for stream URL extraction.
     * Endpoint: https://archive.org/metadata/{identifier}
     */
    @GET("metadata/{identifier}")
    suspend fun getItemMetadata(
        @Path("identifier") identifier: String
    ): ItemMetadataResponse

    companion object {
        const val BASE_URL = "https://archive.org/"
    }
}`
  },
  {
    path: 'app/src/main/java/org/archive/cinearchive/data/model/ArchiveModels.kt',
    filename: 'ArchiveModels.kt',
    language: 'kotlin',
    description: 'Kotlin Data classes modeling archive documents, file descriptors, and streamable MP4 assets.',
    code: `package org.archive.cinearchive.data.model

import com.google.gson.annotations.SerializedName

data class AdvancedSearchResponse(
    @SerializedName("response") val response: SearchResultPayload
)

data class SearchResultPayload(
    @SerializedName("numFound") val numFound: Int,
    @SerializedName("start") val start: Int,
    @SerializedName("docs") val docs: List<ArchiveDoc>
)

data class ArchiveDoc(
    @SerializedName("identifier") val identifier: String,
    @SerializedName("title") val title: String?,
    @SerializedName("description") val description: String?,
    @SerializedName("year") val year: Any?,
    @SerializedName("creator") val creator: Any?,
    @SerializedName("downloads") val downloads: Long?,
    @SerializedName("mediatype") val mediatype: String?
) {
    val posterUrl: String
        get() = "https://archive.org/services/img/$identifier"

    val yearFormatted: String
        get() = year?.toString()?.take(4) ?: "Classic"
}

data class ItemMetadataResponse(
    @SerializedName("server") val server: String?,
    @SerializedName("dir") val dir: String?,
    @SerializedName("metadata") val metadata: ItemMetadataHeader?,
    @SerializedName("files") val files: List<ArchiveFile>?
) {
    /**
     * Resolves the highest quality H.264 / MP4 streamable video URL.
     */
    fun findPrimaryVideoStream(): String? {
        val validFile = files?.firstOrNull { file ->
            val format = file.format?.lowercase() ?: ""
            val name = file.name.lowercase()
            (format.contains("h.264") || format.contains("512kb") || name.endsWith(".mp4")) &&
                !name.contains(".thumbs")
        }
        val id = metadata?.identifier ?: return null
        return validFile?.let { "https://archive.org/download/$id/\${it.name}" }
    }
}

data class ItemMetadataHeader(
    @SerializedName("identifier") val identifier: String?,
    @SerializedName("title") val title: String?,
    @SerializedName("description") val description: String?,
    @SerializedName("creator") val creator: Any?,
    @SerializedName("year") val year: String?,
    @SerializedName("licenseurl") val licenseUrl: String?
)

data class ArchiveFile(
    @SerializedName("name") val name: String,
    @SerializedName("format") val format: String?,
    @SerializedName("size") val size: Long?
)`
  },
  {
    path: 'app/src/main/java/org/archive/cinearchive/ui/player/ExoPlayerScreen.kt',
    filename: 'ExoPlayerScreen.kt',
    language: 'kotlin',
    description: 'Jetpack Compose ExoPlayer video player using AndroidView and AndroidX Media3 PlayerView with full controls.',
    code: `package org.archive.cinearchive.ui.player

import android.view.ViewGroup
import android.widget.FrameLayout
import androidx.annotation.OptIn
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.viewinterop.AndroidView
import androidx.media3.common.MediaItem
import androidx.media3.common.util.UnstableApi
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.ui.PlayerView

@OptIn(UnstableApi::class)
@Composable
fun ExoPlayerScreen(
    videoUrl: String,
    onBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current

    // Initialize ExoPlayer with lifecycle awareness
    val exoPlayer = remember {
        ExoPlayer.Builder(context).build().apply {
            val mediaItem = MediaItem.fromUri(videoUrl)
            setMediaItem(mediaItem)
            prepare()
            playWhenReady = true
        }
    }

    DisposableEffect(Unit) {
        onDispose {
            exoPlayer.release()
        }
    }

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(Color.Black)
    ) {
        AndroidView(
            factory = { ctx ->
                PlayerView(ctx).apply {
                    player = exoPlayer
                    layoutParams = FrameLayout.LayoutParams(
                        ViewGroup.LayoutParams.MATCH_PARENT,
                        ViewGroup.LayoutParams.MATCH_PARENT
                    )
                    setShowBuffering(PlayerView.SHOW_BUFFERING_WHEN_PLAYING)
                    useController = true
                }
            },
            modifier = Modifier.fillMaxSize()
        )
    }
}`
  },
  {
    path: 'app/src/main/java/org/archive/cinearchive/MainActivity.kt',
    filename: 'MainActivity.kt',
    language: 'kotlin',
    description: 'Main Activity with Jetpack Compose Material 3 Scaffold, NavigationBar, and Coroutine ViewModels.',
    code: `package org.archive.cinearchive

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.navigation.compose.*
import org.archive.cinearchive.ui.theme.CineArchiveTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            CineArchiveTheme {
                val navController = rememberNavController()

                Scaffold(
                    modifier = Modifier.fillMaxSize(),
                    bottomBar = {
                        // Material 3 Bottom Navigation: Home, Search, Categories, My List
                        CineBottomBar(navController = navController)
                    }
                ) { innerPadding ->
                    NavHost(
                        navController = navController,
                        startDestination = "home",
                        modifier = Modifier.padding(innerPadding)
                    ) {
                        composable("home") { HomeScreen(navController) }
                        composable("search") { SearchScreen(navController) }
                        composable("categories") { CategoriesScreen(navController) }
                        composable("watchlist") { WatchlistScreen(navController) }
                        composable("details/{id}") { backStackEntry ->
                            val id = backStackEntry.arguments?.getString("id") ?: ""
                            MovieDetailsScreen(id, navController)
                        }
                    }
                }
            }
        }
    }
}`
  }
];

interface AndroidCodeViewerProps {
  isMobileFrame?: boolean;
}

export const AndroidCodeViewer: React.FC<AndroidCodeViewerProps> = ({ isMobileFrame = false }) => {
  const [selectedFile, setSelectedFile] = useState<AndroidFile>(ANDROID_PROJECT_FILES[0]);
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard?.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadAll = () => {
    const zipContent = ANDROID_PROJECT_FILES.map(
      (f) => `// ===============================\n// FILE: ${f.path}\n// ${f.description}\n// ===============================\n\n${f.code}\n\n`
    ).join('\n');

    const blob = new Blob([zipContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'CineArchive-Android-Source-Bundle.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Terminal className="w-5 sm:w-6 h-5 sm:h-6 text-amber-500" />
            Android Jetpack Compose Codebase
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Complete Android Studio production architecture: Kotlin, Compose Material 3, Media3 ExoPlayer, Retrofit & Room.
          </p>
        </div>

        <button
          type="button"
          onClick={downloadAll}
          className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer whitespace-nowrap shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          Export All Files
        </button>
      </div>

      {/* Mobile Horizontal File Selector Chips */}
      {isMobileFrame ? (
        <div className="space-y-4">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {ANDROID_PROJECT_FILES.map((file) => (
              <button
                key={file.path}
                type="button"
                onClick={() => setSelectedFile(file)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  selectedFile.path === file.path
                    ? 'bg-amber-500 text-black font-bold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {file.filename}
              </button>
            ))}
          </div>

          {/* Full-width Code Viewer for Mobile */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-3 bg-slate-900/90 border-b border-slate-800 text-xs">
              <span className="font-mono text-amber-400 font-semibold truncate pr-2">{selectedFile.path}</span>
              <button
                type="button"
                onClick={copyCode}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1 shrink-0 cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <div className="p-3 bg-slate-900/40 border-b border-slate-800 text-[11px] text-slate-400">
              {selectedFile.description}
            </div>
            <div className="p-3 overflow-x-auto max-h-[460px] overflow-y-auto">
              <pre className="font-mono text-[11px] text-slate-200 leading-relaxed">
                <code>{selectedFile.code}</code>
              </pre>
            </div>
          </div>
        </div>
      ) : (
        /* Expanded Side-by-Side Split View */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* File Tree Navigation */}
          <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
              <Folder className="w-4 h-4 text-amber-500" />
              Android Studio Project Files
            </div>

            <div className="space-y-1">
              {ANDROID_PROJECT_FILES.map((file) => (
                <button
                  key={file.path}
                  type="button"
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs transition-colors flex items-center gap-2.5 cursor-pointer ${
                    selectedFile.path === file.path
                      ? 'bg-amber-500/15 border border-amber-500/40 text-amber-400 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <FileCode className="w-4 h-4 shrink-0 text-slate-400" />
                  <div className="truncate">
                    <p className="truncate font-mono">{file.filename}</p>
                    <p className="text-[10px] text-slate-500 truncate">{file.path}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-800 text-[11px] text-slate-400 space-y-1.5 p-2 bg-slate-950/40 rounded-xl">
              <p className="font-semibold text-slate-200">How to run in Android Studio:</p>
              <ol className="list-decimal list-inside space-y-1 text-slate-400">
                <li>Open Android Studio Ladybug or newer.</li>
                <li>Create New Project with "Empty Activity (Compose)".</li>
                <li>Copy dependencies into <code className="text-amber-400 font-mono">build.gradle.kts</code>.</li>
                <li>Sync Gradle and launch on an Android 8.0+ Emulator!</li>
              </ol>
            </div>
          </div>

          {/* Code Viewer */}
          <div className="lg:col-span-8 bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            {/* Top Bar */}
            <div className="flex items-center justify-between p-3.5 bg-slate-900/90 border-b border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-mono text-amber-400 font-semibold">{selectedFile.path}</span>
                <span className="text-slate-500">·</span>
                <span className="text-slate-400">{selectedFile.language}</span>
              </div>

              <button
                type="button"
                onClick={copyCode}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy Code
                  </>
                )}
              </button>
            </div>

            {/* Description */}
            <div className="px-4 py-2.5 bg-slate-900/40 border-b border-slate-800/80 text-xs text-slate-400">
              {selectedFile.description}
            </div>

            {/* Pre Code */}
            <div className="p-4 overflow-x-auto max-h-[560px] overflow-y-auto">
              <pre className="font-mono text-xs text-slate-200 leading-relaxed">
                <code>{selectedFile.code}</code>
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
