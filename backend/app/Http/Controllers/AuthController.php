<?php

namespace App\Http\Controllers;

use App\Mail\ResetPasswordCode;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid credentials.'], 401);
        }

        $token = $user->createToken('admin-token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => [
                'email' => $user->email,
                'name' => $user->name,
            ]
        ]);
    }

    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            // We don't want to reveal if a user exists or not for security,
            // but for a single-admin site, it's okay to just return success.
            return response()->json(['message' => 'If this email is registered, you will receive a code shortly.']);
        }

        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $user->email],
            [
                'token' => Hash::make($code),
                'created_at' => now(),
            ]
        );

        try {
            Mail::to($user->email)->send(new ResetPasswordCode($code));
        } catch (\Exception $e) {
            \Log::error("Failed to send reset email: " . $e->getMessage());
            return response()->json(['message' => 'Failed to send email. Check backend logs.'], 500);
        }

        return response()->json(['message' => 'Reset code sent to your email.']);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'code' => 'required|string',
            'password' => 'required|min:4|confirmed',
        ]);

        $reset = DB::table('password_reset_tokens')->where('email', $request->email)->first();

        if (!$reset || !Hash::check($request->code, $reset->token)) {
            return response()->json(['message' => 'Invalid or expired code.'], 400);
        }

        if (now()->diffInMinutes($reset->created_at) > 15) {
            return response()->json(['message' => 'Code has expired.'], 400);
        }

        $user = User::where('email', $request->email)->first();
        if ($user) {
            $user->update(['password' => Hash::make($request->password)]);
            DB::table('password_reset_tokens')->where('email', $request->email)->delete();
            return response()->json(['message' => 'Password has been reset successfully.']);
        }

        return response()->json(['message' => 'User not found.'], 404);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully.']);
    }
}
