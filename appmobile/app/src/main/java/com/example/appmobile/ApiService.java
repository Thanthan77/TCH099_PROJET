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

    @GET("disponibilitees/services/id/{id_service}")
    Call<List<HoraireRequest>> getHoraire(@Path("id_service") int idService);
    @GET("rendezvous/patient/{courriel}")
    Call<RdvResponse> getRDV(@Path("courriel") String courriel);

   @POST("rendez_vous")
   Call<List<RdvRequest>> postModifRdv();

    @PUT("rendezVous/id/patient/{numRdv}")
    Call<Void> putAnnulerRdv(
            @Path("numRdv") int idRdv,
            @Body Map<String, String> body
    );

    @POST("inscription_patient")
    Call<ResponseBody> inscrirePatient(@Body RequestBody body);

    @GET("patient/{courriel}")
    Call<Patient> getPatient(@Path("courriel") String courriel);


    @PUT("modifier_patient")
    Call<Void> updatePatient(@Body Map<String, String> data);

    @PUT("mdp_put")
    Call<ResponseBody> changerMotDePasse(@Body Map<String, String> data);

}



