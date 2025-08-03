package com.example.appmobile;

import java.util.List;
import java.util.Map;

import com.example.appmobile.PagesRDV.HoraireRequest;
import com.example.appmobile.PagesRDV.ServiceRequest;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.POST;
import retrofit2.http.PUT;
import retrofit2.http.Path;
import retrofit2.http.Query;
import okhttp3.RequestBody;
import okhttp3.ResponseBody;

public interface ApiService {
    @POST("login_patient")
    Call<LoginResponse> login(@Body LoginRequest request);

    @GET("services")
    Call<List<ServiceRequest>> getServices();

   @GET ("disponibilité")
    Call<List<HoraireRequest>> getHoraire () ;

    @GET("rendezvous/patient/{courriel}")
    Call<List<RdvRequest>> getRDV(@Path("courriel") String courriel);
   @POST("rendez_vous")
   Call<List<RdvRequest>> postModifRdv();

    @PUT("rendezVous/id/patient/{numRdv}")
Call<Void> putAnnulerRdv(@Path("numRdv") int idRdv);

    @POST("inscription_patient.php")
    Call<ResponseBody> inscrirePatient(@Body RequestBody body);
    @GET("patient_get.php")
    Call<List<Patient>> getPatient(@Query("courriel") String courriel);

    @PUT("patient_put.php")
    Call<Void> updatePatient(@Body Map<String, String> data);

}



