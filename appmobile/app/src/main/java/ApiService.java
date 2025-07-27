import com.example.appmobile.LoginRequest;
import com.example.appmobile.LoginResponse;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.POST;

public interface ApiService {
    @POST("api/login_patient")
    Call<LoginResponse> login(@Body LoginRequest request);
    @POST("api/inscription_patient")
    Call<Void> inscrire(@Body RegisterRequest request);

}
