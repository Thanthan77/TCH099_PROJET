package com.example.appmobile;

import android.widget.TextView;

import java.util.List;

import com.example.appmobile.PagesRDV.HoraireRequest;
import com.example.appmobile.PagesRDV.ServiceRequest;
import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.POST;
import retrofit2.http.PUT;
import retrofit2.http.Path;

public interface ApiService {
    @POST("api/login_patient")
    Call<LoginResponse> login(@Body LoginRequest request);

    @GET("api/services")
    Call<List<ServiceRequest>> getServices();

   @GET ("api/disponibilité")
    Call<List<HoraireRequest>> getHoraire () ;

    @GET("api/rendezvous/patient/{courriel}")
    Call<List<RdvRequest>> getRDV(@Path("courriel") String courriel);
   @POST("api/rendez_vous")
   Call<List<RdvRequest>> postModifRdv();

    @PUT("api/rendezVous/id/patient/{numRdv}")
Call<Void> putAnnulerRdv(@Path("numRdv") int idRdv);
}



