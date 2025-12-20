"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerStoreUser } from "@/actions/WC/Auth/getAuth";
import Input from "@/Shared/Input/Input";
import Password from "@/Shared/Input/Password";
import FormButton from "@/Shared/Button/FormButton";
import { AlertCircle } from "lucide-react";

const Register = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        reset
    } = useForm({
        mode: "onChange", // live validation
    });

    const router = useRouter();

    const [error, setError] = useState("");


    const onSubmit = async (data) => {

        const { first_name, last_name, email, password } = data;
        try {
            const response = await registerStoreUser({
                username: email, display_name: `${first_name} ${last_name}`, first_name: first_name, last_name: last_name, email: email, password: password, nickname: `${first_name} ${last_name}`
            });
            if (response.id) {
                router.push('/login');
                setError("");
                reset();
            }

        } catch (error) {
            console.log(error.message);
            setError(error.message);
        }
    };

    // watch values for live validation and "Ayon" display
    const firstNameValue = watch("first_name") || "";
    const lastNameValue = watch("last_name") || "";
    const emailValue = watch("email") || "";
    const passwordValue = watch("password") || "";

    return (
        <div>
            {
                error && (
                    <div className='flex items-center gap-x-3 border-[#8b0000] border-2 py-4 px-8 mt-6 rounded-sm bg-[#F9F2F5]'>
                        <AlertCircle className='inline text-white fill-[#8b0000] lg:w-6 lg:h-6 w-[30%]' />
                        <p className='lg:text-base text-sm leading-[100%] font-semibold text-[#8b0000]' dangerouslySetInnerHTML={{ __html: error }} />
                        {/* <Link href={'/'} className='text-[#47AAFD] inline'> Lost your password</Link>? */}
                    </div>
                )
            }
            <div className="flex items-center justify-center lg:mt-[80px] mt-[40px] global-margin">
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            handleSubmit(onSubmit)();
                        }
                    }}
                    className="max-w-[420px] w-full py-[50px] px-[35px] bg-[#F0F0F0] rounded-[4px]"
                >
                    <h1 className="lg:text-5xl lg:leading-[53px] font-bold mb-8 text-2xl leading-[26px] text-center">
                        Sign up
                    </h1>

                    {/* FIRST NAME */}
                    <div className="mb-7">
                        <Input
                            label="First Name"
                            id="first_name"
                            type="text"
                            placeholder=""
                            register={register("first_name", {
                                validate: (value) => {
                                    // if (value.length < 2) return true; // no error before 2 letters
                                    return value ? true : "First Name is Required";
                                },
                            })}
                            error={errors.first_name?.message}
                            registerPage={true}
                            value={firstNameValue}
                        />
                    </div>

                    {/* LAST NAME */}
                    <div className="mb-7">
                        <Input
                            label="Last Name"
                            id="last_name"
                            type="text"
                            placeholder=""
                            register={register("last_name", {
                                validate: (value) => {
                                    // if (value.length < 2) return true;
                                    return value ? true : "Last Name is Required";
                                },
                            })}
                            error={errors.last_name?.message}
                            registerPage={true}
                            value={lastNameValue}
                        />
                    </div>

                    {/* EMAIL */}
                    <div className="mb-7">
                        <Input
                            label="Email or Username"
                            id="email"
                            type="text"
                            placeholder=""
                            register={register("email", {
                                required: "Email or Username is required",
                            })}
                            error={errors.email?.message}
                            registerPage={true}
                            value={emailValue}
                        />
                    </div>

                    {/* PASSWORD */}
                    <div className="mb-7">
                        <Password
                            label="Password"
                            id="password"
                            placeholder=""
                            register={register("password", {
                                validate: (value) => {
                                    // if (value.length < 2) return true; // no error before 2 letters

                                    // REGEX: min 6 chars, 1 number, 1 capital letter
                                    const regex = /^(?=.*[A-Z])(?=.*\d).{6,}$/;
                                    if (!regex.test(value)) {
                                        return "Min 6 chars, include number & capital letter";
                                    }

                                    if (
                                        firstNameValue &&
                                        value.toLowerCase().includes(firstNameValue.toLowerCase())
                                    ) {
                                        return "Password must not contain your first name";
                                    }

                                    if (
                                        emailValue &&
                                        value.toLowerCase().includes(emailValue.toLowerCase())
                                    ) {
                                        return "Password must not contain your email";
                                    }

                                    return true;
                                },
                            })}
                            error={errors.password?.message}
                            registerPage={true}
                            value={passwordValue}
                        />
                    </div>

                    {/* NEWSLETTER CHECK */}
                    <div className="flex flex-col mt-6 gap-1">
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                {...register("yes", { required: "You must agree to continue" })}
                                className="w-4 h-4"
                            />
                            <p className="text-[15px] leading-[19px]">
                                I would like to receive exclusive offers
                            </p>
                        </div>

                        {/* Error message */}
                        {errors.yes && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.yes.message}
                            </p>
                        )}
                    </div>

                    {/* PRIVACY INFO */}
                    <div className="mt-6">
                        <p className="text-sm font-semibold leading-[17px]">
                            Your personal data will be used to assist you during your visit to the
                            website, manage access to your account, and for other reasons described
                            in our{" "}
                            <span className="text-[#1D98FE]">politique de confidentialité</span>.
                        </p>
                    </div>

                    {/* SUBMIT BUTTON */}
                    <div className="mt-6 flex items-center justify-center">
                        <FormButton type="submit" label={"sign up"} />
                    </div>

                    {/* SIGN IN LINK */}
                    <div className="mt-6 font-semibold text-base leading-[24px] text-center">
                        <Link href={"/login"} className="underline">
                            Sign in with another email address
                        </Link>
                    </div>
                </form>
            </div>

        </div>
    );
};

export default Register;
