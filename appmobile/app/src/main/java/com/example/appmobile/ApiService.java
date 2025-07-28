package com.example.appmobile;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.POST;

public interface ApiService {
    @POST("api/login_patient")
    Call<LoginResponse> login(@Body LoginRequest request);
}
