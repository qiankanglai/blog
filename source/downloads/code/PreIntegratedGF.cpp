// @author: Kanglai Qian
// @date: 20150814
// @url: http://qiankanglai.me/misc/2014/12/26/PBR
#include <stdio.h>
#include <stdlib.h>
#include <time.h>
#define _USE_MATH_DEFINES
#include <math.h>

static const int resolution = 1024;
static const int NumSamples = 256;

struct vec2{
    double x, y;
    vec2(double _x, double _y) :x(_x), y(_y) {};

    vec2& operator /=(const double& b)
    {
        x /= b;
        y /= b;
        return *this;
    }
};
struct ivec2{
    int x, y;
};

struct vec3{
    double x, y, z;
    vec3(double _x, double _y, double _z) :x(_x), y(_y), z(_z) {};

    double dot(const vec3& b)
    {
        return x*b.x + y*b.y + z*b.z;
    }
};
vec3 operator*(const double& a, const vec3& b)
{
    return vec3(b.x * a, b.y * a, b.z * a);
}
vec3 operator-(const vec3& a, const vec3& b)
{
    return vec3(a.x - b.x, a.y - b.y, a.z - b.z);
}

inline double saturate(double x)
{
    if (x < 0) x = 0;
    if (x > 1) x = 1;
    return x;
}

unsigned int ReverseBits32(unsigned int bits)
{
    bits = (bits << 16) | (bits >> 16);
    bits = ((bits & 0x00ff00ff) << 8) | ((bits & 0xff00ff00) >> 8);
    bits = ((bits & 0x0f0f0f0f) << 4) | ((bits & 0xf0f0f0f0) >> 4);
    bits = ((bits & 0x33333333) << 2) | ((bits & 0xcccccccc) >> 2);
    bits = ((bits & 0x55555555) << 1) | ((bits & 0xaaaaaaaa) >> 1);
    return bits;
}

inline double rand_0_1()
{
    return 1.0 * rand() / RAND_MAX;
}
inline unsigned int rand_32bit()
{
    unsigned int x = rand() & 0xff;
    x |= (rand() & 0xff) << 8;
    x |= (rand() & 0xff) << 16;
    x |= (rand() & 0xff) << 24;
    return x;
}
// using uniform randomness :(
double t1 = rand_0_1();
unsigned int t2 = rand_32bit();
vec2 Hammersley(int Index, int NumSamples)
{
    double E1 = 1.0 * Index / NumSamples + t1;
    E1 = E1 - int(E1);
    double E2 = double(ReverseBits32(Index) ^ t2) * 2.3283064365386963e-10;
    return vec2(E1, E2);
}

vec3 ImportanceSampleGGX(vec2 E, double Roughness)
{
    double m = Roughness * Roughness;
    double m2 = m * m;

    double Phi = 2 * M_PI * E.x;
    double CosTheta = sqrt((1 - E.y) / (1 + (m2 - 1) * E.y));
    double SinTheta = sqrt(1 - CosTheta * CosTheta);

    vec3 H(SinTheta * cos(Phi), SinTheta * sin(Phi), CosTheta);

    double d = (CosTheta * m2 - CosTheta) * CosTheta + 1;
    double D = m2 / (M_PI*d*d);
    double PDF = D * CosTheta;

    return H;
}

double Vis_SmithJointApprox(double Roughness, double NoV, double NoL)
{
    double a = Roughness * Roughness;
    double Vis_SmithV = NoL * (NoV * (1 - a) + a);
    double Vis_SmithL = NoV * (NoL * (1 - a) + a);
    return 0.5 / (Vis_SmithV + Vis_SmithL);
}

vec2 IntegrateBRDF(double Roughness, double NoV)
{
    if (Roughness < 0.04) Roughness = 0.04;

    vec3 V(sqrt(1 - NoV*NoV), 0, NoV);
    double A = 0, B = 0;
    for (int i = 0; i < NumSamples; i++)
    {
        vec2 E = Hammersley(i, NumSamples);
        vec3 H = ImportanceSampleGGX(E, Roughness);
        vec3 L = 2 * V.dot(H) * H - V;

        double NoL = saturate(L.z);
        double NoH = saturate(H.z);
        double VoH = saturate(V.dot(H));

        if (NoL > 0)
        {
            double Vis = Vis_SmithJointApprox(Roughness, NoV, NoL);

            double a = Roughness * Roughness;
            double a2 = a*a;
            double Vis_SmithV = NoL * sqrt(NoV * (NoV - NoV * a2) + a2);
            double Vis_SmithL = NoV * sqrt(NoL * (NoL - NoL * a2) + a2);

            double NoL_Vis_PDF = NoL * Vis * (4 * VoH / NoH);

            double Fc = pow(1 - VoH, 5);
            A += (1 - Fc) * NoL_Vis_PDF;
            B += Fc * NoL_Vis_PDF;
        }
    }
    vec2 res(A, B);
    res /= NumSamples;
    return res;
}
int main()
{
    srand(time(0));
    FILE* ppmfile = fopen("PreIntegratedGF.ppm", "wb");
    fprintf(ppmfile, "P3\n%d %d\n%d\n", resolution, resolution, 255);
    for (int x = 0; x < resolution; x++)
    {
        for (int y = 0; y < resolution; y++)
        {
            vec2 brdf = IntegrateBRDF(1 - 1.0 * x / (resolution - 1), 1.0 * y / (resolution - 1));
            fprintf(ppmfile, " %03d %03d %03d\n", int(brdf.x * 255), int(brdf.y * 255), 0);
        }
    }
    fclose(ppmfile);

    return 0;
}