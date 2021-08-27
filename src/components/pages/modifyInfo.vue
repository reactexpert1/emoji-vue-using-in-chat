<template>
  <div>
    <div class="head">
      <i class="iconfont icon-right" @click="goBack"></i>
    </div>
    <div class="avatar">
      <img :src="form.avatar" alt>
      <p>{{ this.form.username }}</p>
    </div>
    <form>
      <p class="InputTitle">username:</p>
      <input type="text" v-model="form.username" class="basicInput">
      <p class="InputTitle">old password:</p>
      <input type="password" class="basicInput" v-model="form.oldPassword">
      <p class="InputTitle">new password:</p>
      <input type="password" class="basicInput" v-model="form.newPassword">
      <p class="InputTitle">Confirm Password:</p>
      <input
        type="password"
        class="basicInput makesure"
        v-model="form.newPasswordAgain"
        @blur="comparePassword"
      >
      <p class="InputTitle">Avatar:</p>
      <input type="file" class="fileInput" @change="changeAvatar" ref="avatar">
      <button @click="submit" class="submit">Submit changes</button>
    </form>
  </div>
</template>

<script>
export default {
  name: "modifyInfo",
  data() {
    return {
      form: {
        user: null,
        username: null,
        avatar: null,
        oldPassword: null,
        newPassword: null,
        newPasswordAgain: null
      }
    };
  },
  created() {
    this.form.user = sessionStorage.getItem("user");
    this.form.avatar = sessionStorage.getItem("avatar");
    this.form.username = sessionStorage.getItem("user");
    console.log(this.$route.params);
  },
  methods: {
    goBack() {
      this.$router.go(-1);
    },
    changeAvatar(e) {
      // console.log(e.target.files[0])
      console.log(this.form.avatar);
      this.form.avatar = this.getObjectURL(e.target.files[0]);
      console.log(this.form.avatar);
    },
    getObjectURL(file) {
      var url = null;
      // The effect of the following functions is the same, but different js functions need to be executed for different browsers.
      if (window.createObjectURL != undefined) {
        // basic
        url = window.createObjectURL(file);
      } else if (window.URL != undefined) {
        // mozilla(firefox)
        url = window.URL.createObjectURL(file);
      } else if (window.webkitURL != undefined) {
        // webkit or chrome
        url = window.webkitURL.createObjectURL(file);
      }
      return url;
    },
    submit(e) {
      e.preventDefault();
      console.log(this.form);
      if (!this.comparePassword()) {
        return false;
      }
      var formData = new FormData();
      formData.append("username", this.form.username);
      formData.append("user", this.form.user);
      formData.append("password", this.form.password);
      formData.append("newPassword", this.form.newPassword);
      formData.append("oldPassword", this.form.oldPassword);
      if(this.$refs.avatar.files.length == 0){
        console.log("0")
        formData.append("avatar", this.form.avatar);
        console.log(this.form.avatar)
      } else {
        formData.append("avatar", this.$refs.avatar.files[0]);
        console.log(this.$refs.avatar.files[0]) 
      }
      this.$axios
        .post("/modifyInfo", formData)
        .then(res => {
          if(res.data.code == 200){
            alert(res.data.msg)
            this.$router.push('/')
          }
        })
        .catch(err => {
          console.log(err);
        });
    },
    comparePassword() {
      // Prompt that the new password input is inconsistent
      if (this.form.newPasswordAgain !== this.form.newPassword) {
        alert("myTest");
        return false;
      } else {
        return true;
      }
    }
  }
};
</script>

<style scoped>
/* head */
.head {
  position: absolute;
  top: 1rem;
  left: 21rem;
  margin-right: 0.625rem;
}
.head i {
  font-size: 1.8rem;
}

/* avatar */
.avatar img {
  width: 34%;
  height: 34%;
  margin-left: 33%;
  margin-top: 15%;
  border-radius: 50%;
}
.avatar p {
  text-align: center;
  font-weight: bolder;
  font-size: 20px;
}

/* form */
form {
  padding-left: 40px;
  margin-top: 50px;
}

/* input */
.basicInput {
  width: 12rem;
  display: inline-block;
  padding: 0.5rem;
  margin: 0.5rem 0rem;
  background-color: rgb(94, 93, 180);
  color: rgb(168, 160, 160);
  border: 0px;
  border-bottom: 0.05rem solid rgb(22, 16, 16);
  text-align: center;
  font-size: 1.5rem;
  letter-spacing: 2px;
  outline: 0;
}

.makesure {
  width: 11rem;
}

.InputTitle {
  padding: 0 0.5rem;
  display: inline-block;
  font-size: 1rem;
  color: #eee;
}

/* file */
::-ms-browse,
[type="file"] {
  display: inline-block;
  padding: 0.15em;
  line-height: 1.5rem;
  border: 0;
  background: #f0f3f9;
  color: #34538b;
}
::-webkit-file-upload-button {
  display: inline-block;
  padding: 0 0.5em;
  line-height: 1.7rem;
  border: 0;
  background: rgb(60, 32, 139);
  color: #ccc;
  border-radius: 5%;
}
.file {
  position: relative;
}
.fileInput {
  width: 13rem;
  /* position: absolute; */
  overflow: hidden;
  margin-left: 1rem;
  margin-top: 1rem;
  /* right: 0; */
  /* top: 0; */
  /* opacity: 0.5; */
}

.submit {
  background-color: rgb(60, 32, 139);
  color: #ccc;
  border: 0;
  border-radius: 3px;
  padding: 7px 10px;
  margin-top: 1.5rem;
  margin-left: 14rem;
}
</style>