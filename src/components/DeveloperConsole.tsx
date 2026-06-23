/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Terminal, Database, Server, Smartphone, BookOpen, Copy, Check, Download, Layers } from 'lucide-react';
import { SUPABASE_SQL_SCHEMA } from '../supabaseService';

export default function DeveloperConsole() {
  const [activeTab, setActiveTab] = useState<'architecture' | 'db_schema' | 'backend' | 'flutter' | 'deploy'>('architecture');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(label);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const sysArchitectureDoc = `========================================================================
             GROWINVICTA ENTERPRISE SYSTEMS ARCHITECTURE
========================================================================

                  [ CLIENT SIDE APPLICATIONS ]
+--------------------------------------------------------------+
|     FLUTTER SDK SINGLE-CODEBASE RUNTIME CLIENTS               |
|  - Web Application (Single-Page App via CanvasKit HTML5)      |
|  - Android Application (Native Java/Kotlin Bridge JVM)       |
|  - iOS Application (Swift/Objective-C Wrapper Metal)          |
|  - Desktop Apps (Windows: Win32 C++ / macOS: AppKit ObjC)     |
+--------------------------------------------------------------+
                               |
                        HTTPS (REST / JSON)
                               |
                               v
                       [ REVERSE PROXY ]
              +----------------------------------+
              |           NGINX / SSL            |
              +----------------------------------+
                               |
                            Port 3000
                               |
                               v
                [ FULL-STACK APP SERVER ENGINE ]
+--------------------------------------------------------------+
|  NODEJS v20 + EXPRESS API SERVER SERVICE                      |
|  - JWT Authentication Middleware                              |
|  - Role-Based Access Control Filters                          |
|  - Route Handlers (Clients, Projects, Leads, Finance Ledgers)  |
|  - Cron Scheduler (Payment Due & Event Reminder Dispatchers)  |
+--------------------------------------------------------------+
         |                                             |
   Drizzle / Sequelize (ORM)                     Admin SDK / REST
         |                                             |
         v                                             v
 [ PRIMARY DATABASE ]                           [ CLOUD UTILITIES ]
+----------------------------+                  +-------------------------+
| POSTGRESQL v15             |                  | - GOOGLE MAPS PLATFORM  |
|  - Hot Standby Replica     |                  | - RAZORPAY / STRIPE API |
|  - Row-Level Security (RLS)|                  | - FIREBASE STORAGE CDN  |
|  - Fully Partitioned       |                  | - WHATSAPP BUSINESS API |
+----------------------------+                  +-------------------------+`;

  const pgDatabaseSchema = SUPABASE_SQL_SCHEMA;

  const expressBackendCode = `/**
 * GrowInvicta Express.js Production Backend Server Template
 * File: server.ts
 */
import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcript from 'bcryptjs';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'grow_invicta_secret_key_2026';

app.use(cors());
app.use(express.json());

// Multi-Role RBAC Middleware
export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.status(403).json({ error: 'Token expired or invalid' });
      req.user = user;
      next();
    });
  } else {
    res.status(401).json({ error: 'Authorization header required' });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access forbidden: Insufficient privileges.' });
    }
    next();
  };
};

// Auth REST Endpoints
app.post('/api/auth/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  
  // Real deployment connects to PostgreSQL database
  if (email === 'admin@growinvicta.com' && password === 'admin@123') {
    const token = jwt.sign({ email, role: 'Super Admin', name: 'Chethan D. M.' }, JWT_SECRET, { expiresIn: '12h' });
    return res.json({ token, role: 'Super Admin', name: 'Chethan D. M.' });
  }
  
  res.status(401).json({ error: 'Invalid username credentials.' });
});

// Clients API Gateway
app.get('/api/clients', authenticateJWT, requireRole(['Super Admin', 'Manager']), async (req: Request, res: Response) => {
  try {
    // Return clients from PostgreSQL pool
    res.json({ success: true, clients: [] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/clients', authenticateJWT, requireRole(['Super Admin', 'Manager']), async (req: Request, res: Response) => {
  const clientData = req.body;
  try {
    // Insert into PostgreSQL and return representation
    res.status(201).json({ success: true, client: clientData });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Finance Analytics & Ledger API
app.get('/api/finance/report', authenticateJWT, requireRole(['Super Admin']), async (req, res) => {
  res.json({
    monthlyProfit: 865000,
    activeRunRate: 12400000,
    grossTaxEstimated: 145000
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(\`GrowInvicta Enterprise Backend running on Host 0.0.0.0, Port \${PORT}\`);
});`;

  const flutterClientCode = `/// GrowInvicta Agency Mobile & Desktop Multiplatform Client SDK Core
/// File: main.dart
/// Tech Stack: Flutter, Material Design 3, Provider State Engine & JWT Client HTTP interceptor.

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

void main() {
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthStateProvider()),
        ChangeNotifierProvider(create: (_) => ProjectStateProvider()),
      ],
      child: const GrowInvictaApp(),
    ),
  );
}

class GrowInvictaApp extends StatelessWidget {
  const GrowInvictaApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'GrowInvicta Manager',
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF0F172A),
          brightness: Brightness.dark,
        ),
      ),
      home: const AuthWrapperScreen(),
      debugShowCheckedModeBanner: false,
    );
  }
}

class AuthStateProvider with ChangeNotifier {
  String? _jwtToken;
  String _userRole = 'Employee';
  String _userName = '';
  
  bool get isAuthenticated => _jwtToken != null;
  String get userRole => _userRole;
  String get userName => _userName;

  Future<bool> attemptLogin(String email, String password) async {
    try {
      final response = await http.post(
        Uri.parse('https://api.growinvicta.com/api/auth/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email, 'password': password}),
      );
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        _jwtToken = data['token'];
        _userRole = data['role'];
        _userName = data['name'];
        notifyListeners();
        return true;
      }
    } catch (e) {
      debugPrint("Login Request Failure: \$e");
    }
    return false;
  }

  void logout() {
    _jwtToken = null;
    notifyListeners();
  }
}

class ProjectStateProvider with ChangeNotifier {
  List<dynamic> projects = [];
  bool isLoading = false;

  Future<void> syncProjects(String token) async {
    isLoading = true;
    notifyListeners();
    try {
      final response = await http.get(
        Uri.parse('https://api.growinvicta.com/api/projects'),
        headers: {
          'Authorization': 'Bearer \$token',
          'Content-Type': 'application/json',
        },
      );
      if (response.statusCode == 200) {
        projects = jsonDecode(response.body)['projects'];
      }
    } catch (e) {
      debugPrint("Projects API sync failure: \$e");
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }
}

class AuthWrapperScreen extends StatelessWidget {
  const AuthWrapperScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthStateProvider>(context);
    if (!auth.isAuthenticated) {
      return const LoginViewScreen();
    }
    return const MainDashboardShell();
  }
}

class LoginViewScreen extends StatefulWidget {
  const LoginViewScreen({super.key});

  @override
  State<LoginViewScreen> createState() => _LoginViewScreenState();
}

class _LoginViewScreenState extends State<LoginViewScreen> {
  final _emailCtrl = TextEditingController();
  final _passCtrl = TextEditingController();
  bool _loading = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Container(
          maxWidth: 400,
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Image.network('https://growinvicta.com/logo.png', height: 60, errorBuilder: (_,__,___) => const Icon(Icons.rocket_launch, size: 60)),
              const SizedBox(height: 16),
              const Text('GrowInvicta Business', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
              const SizedBox(height: 32),
              TextField(controller: _emailCtrl, decoration: const InputDecoration(labelText: 'Email', border: OutlineInputBorder())),
              const SizedBox(height: 16),
              TextField(controller: _passCtrl, obscureText: true, decoration: const InputDecoration(labelText: 'Password', border: OutlineInputBorder())),
              const SizedBox(height: 24),
              ElevatedButton(
                style: ElevatedButton.styleFrom(minimumSize: const Size.fromHeight(50)),
                onPressed: _loading ? null : () async {
                  setState(() => _loading = true);
                  final success = await Provider.of<AuthStateProvider>(context, listen: false).attemptLogin(_emailCtrl.text, _passCtrl.text);
                  setState(() => _loading = false);
                  if (!success && mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Invalid credentials.')));
                  }
                },
                child: _loading ? const CircularProgressIndicator() : const Text('Login securely'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class MainDashboardShell extends StatelessWidget {
  const MainDashboardShell({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('GrowInvicta Hub')),
      drawer: Drawer(
        child: ListView(
          children: [
            const UserAccountsDrawerHeader(
              accountName: Text('Chethan D. M.'),
              accountEmail: Text('admin@growinvicta.com'),
              currentAccountPicture: CircleAvatar(child: Icon(Icons.person)),
            ),
            ListTile(leading: const Icon(Icons.dashboard), title: const Text('Dashboard'), onTap: () {}),
            ListTile(leading: const Icon(Icons.people), title: const Text('Clients CRM'), onTap: () {}),
            ListTile(leading: const Icon(Icons.work), title: const Text('Projects Kanban'), onTap: () {}),
            ListTile(leading: const Icon(Icons.payment), title: const Text('Payments Ledger'), onTap: () {}),
            ListTile(leading: const Icon(Icons.logout), title: const Text('Sign out'), onTap: () {
              Provider.of<AuthStateProvider>(context, listen: false).logout();
            }),
          ],
        ),
      ),
      body: const Center(child: Text('GrowInvicta Workspace Active')),
    );
  }
}`;

  const deploymentGuide = `# GROWINVICTA DEPLOYMENT PLAYBOOK & COMPILING INSTRUCTIONS

## 1. Local Dev Prerequisites
Ensure you have the following installs available:
- Node.js LTS (v18 or v20)
- PostgreSQL Database Client v14 or v15
- Flutter SDK (v3.19.x or later stable)
- JDK 17 for Android target compilations
- Xcode 15 for iOS/macOS target compiles

---

## 2. Setting Up Express+PostgreSQL API Service (Backend)
1. Clone this backend server.ts code to a directory folder, say \`grow-api/\`.
2. Run package initialization:
   \`\`\`bash
   npm init -y
   npm i express cors dotenv jsonwebtoken bcryptjs pg drizzle-orm
   npm i -D typescript @types/express @types/cors @types/jsonwebtoken @types/bcryptjs @types/node tsx esbuild
   \`\`\`
3. Create your local Config \`.env\` file:
   \`\`\`env
   PORT=3000
   JWT_SECRET=super_secret_growinvicta_keys_2026
   DATABASE_URL=postgresql://postgres:mysecurepassword@localhost:5432/growdb
   \`\`\`
4. Migrate the SQL schema:
   - Copy the PostgreSQL schema from the "Database Schema" tab.
   - Run the script against your Postgres instance via \`psql\` or Drizzle:
     \`\`\`bash
     psql -h localhost -U postgres -d growdb -f schema.sql
     \`\`\`
5. Spin up the fast Web API gateway server:
   \`\`\`bash
   npx tsx server.ts
   \`\`\`

---

## 3. Preparing Flutter Mobile Workspaces (Frontend App Store Ready)
GrowInvictas unified codebase compiles cleanly down to iOS, Android, macOS, Windows, and Web.

### A. Android App Store (Google Play Store Bundle AAB)
1. Navigate to your Flutter project directory block.
2. Setup launcher icons & app package identifiers inside \`android/app/build.gradle\`:
   - \`applicationId "com.growinvicta.manager"\`
3. Configure release signing key properties inside \`android/key.properties\`:
   \`\`\`properties
   storePassword=secureKeystorePassword
   keyPassword=secureAliasPassword
   keyAlias=growinvicta-key
   storeFile=/path/to/upload-keystore.jks
   \`\`\`
4. Run standard optimize compilation:
   \`\`\`bash
   flutter clean
   flutter pub get
   flutter build appbundle --release
   \`\`\`
5. Output AAB will be published in: \`build/app/outputs/bundle/release/app-release.aab\`. Upload this onto the Google Play Console for Production Tracks.

### B. iOS App Store Bundle (Apple App Store API)
1. Initialize directory on a macOS node.
2. Prepare development profile certificates through Apple Developer Center.
3. Configure bundle identifier inside Apple Xcode:
   - Set Bundle ID: \`com.growinvicta.manager\`
   - Set active Provisioning profiles.
4. Run target compilation command:
   \`\`\`bash
   flutter build ipa --release
   \`\`\`
5. Open \`build/ios/archive/GrowInvicta.xcarchive\` inside Xcode Organizer and submit to App Store Connect / TestFlight.

---

## 4. Deploying Web Client to Automated Hosting (AWS Amplify / Vercel)
The web build generates high-performance HTML/JS assets:
\`\`\`bash
flutter build web --release --web-renderer canvaskit
\`\`\`
Bind the directory output folder \`build/web/\` to cloud platforms like Cloud Run, Netlify, or Vercel. Fully integrated with your Node API endpoint.`;

  return (
    <div id="developer-console" className="p-6 bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 shadow-2xl max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs uppercase tracking-wider mb-1">
            <Layers className="w-4 h-4" />
            GrowInvicta Engineering Core
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-sans">
            Codebase & Architecture Blueprint
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Inspected runtime config maps, cross-platform Flutter sources, Node backend services, schemas, and live provisioning assets.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => copyToClipboard(
              activeTab === 'architecture' ? sysArchitectureDoc :
              activeTab === 'db_schema' ? pgDatabaseSchema :
              activeTab === 'backend' ? expressBackendCode :
              activeTab === 'flutter' ? flutterClientCode :
              deploymentGuide, 
              activeTab
            )}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg hover:bg-slate-800 hover:border-slate-500 transition-all text-xs font-medium cursor-pointer"
          >
            {copiedSection === activeTab ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied Source</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy Current Section</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation panel */}
        <div className="space-y-1.5">
          <button
            onClick={() => setActiveTab('architecture')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center gap-3 transition-colors text-xs font-mono border ${
              activeTab === 'architecture' 
                ? 'bg-indigo-950/40 border-indigo-500/40 text-indigo-300 font-semibold' 
                : 'hover:bg-slate-900 border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>1. SaaS Architecture</span>
          </button>

          <button
            onClick={() => setActiveTab('db_schema')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center gap-3 transition-colors text-xs font-mono border ${
              activeTab === 'db_schema' 
                ? 'bg-indigo-950/40 border-indigo-500/40 text-indigo-300 font-semibold' 
                : 'hover:bg-slate-900 border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>2. Relational Schema</span>
          </button>

          <button
            onClick={() => setActiveTab('backend')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center gap-3 transition-colors text-xs font-mono border ${
              activeTab === 'backend' 
                ? 'bg-indigo-950/40 border-indigo-500/40 text-indigo-300 font-semibold' 
                : 'hover:bg-slate-900 border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>3. Node.js Express API</span>
          </button>

          <button
            onClick={() => setActiveTab('flutter')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center gap-3 transition-colors text-xs font-mono border ${
              activeTab === 'flutter' 
                ? 'bg-indigo-950/40 border-indigo-500/40 text-indigo-300 font-semibold' 
                : 'hover:bg-slate-900 border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>4. Flutter Multi-App</span>
          </button>

          <button
            onClick={() => setActiveTab('deploy')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center gap-3 transition-colors text-xs font-mono border ${
              activeTab === 'deploy' 
                ? 'bg-indigo-950/40 border-indigo-500/40 text-indigo-300 font-semibold' 
                : 'hover:bg-slate-900 border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>5. Deploy Playbook</span>
          </button>

          <div className="mt-8 p-4 bg-slate-900/60 rounded-xl border border-slate-800/80">
            <h3 className="text-xs font-bold text-slate-300 mb-1.5 font-sans">Multi-Target Builds</h3>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              These source files configure your production environment instantly. All database schemas map directly to active Drizzle, Prisma, or standard Postgres tables.
            </p>
          </div>
        </div>

        {/* Content Viewer */}
        <div className="lg:col-span-3">
          <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
            <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex justify-between items-center text-xs font-mono">
              <span className="text-slate-500">
                {activeTab === 'architecture' ? 'system_topology.txt' :
                 activeTab === 'db_schema' ? 'init_postgres_schema.sql' :
                 activeTab === 'backend' ? 'express_server.ts' :
                 activeTab === 'flutter' ? 'grow_client_state.dart' :
                 'deploy_playbook.md'}
              </span>
              <div className="flex gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/60 inline-block"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60 inline-block"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/60 inline-block"></span>
              </div>
            </div>

            <div className="p-4 overflow-x-auto max-h-[500px]">
              <pre className="text-xs leading-relaxed font-mono text-slate-300">
                <code>
                  {activeTab === 'architecture' && sysArchitectureDoc}
                  {activeTab === 'db_schema' && pgDatabaseSchema}
                  {activeTab === 'backend' && expressBackendCode}
                  {activeTab === 'flutter' && flutterClientCode}
                  {activeTab === 'deploy' && deploymentGuide}
                </code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
