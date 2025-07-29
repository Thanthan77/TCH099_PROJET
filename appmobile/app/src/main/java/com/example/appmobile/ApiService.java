package com.example.appmobile;

import java.util.List;

import PagesRDV.HoraireRequest;
import PagesRDV.ServiceRequest;
import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.POST;

public interface ApiService {
    @POST("api/login_patient")
    Call<LoginResponse> login(@Body LoginRequest request);

    @GET("api/services")
    Call<List<ServiceRequest>> getServices();

   @GET ("api/disponibilité")
    Call<List<HoraireRequest>> getHoraire () ;

}
