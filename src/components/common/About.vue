<template>
  <transition name="showAbout">
    <div class="about">
      <i class="iconfont icon-roundclose" @click="closeAbout"></i>
      <h3>About</h3>
      <p>Chat room function:</p>
      <p>&nbsp;&nbsp;&nbsp;&nbsp;Support individual chat, group chat. Avatar upload, send pictures, emoticons</p>
      <p>Technology stack:</p> 
      <p>&nbsp;&nbsp;&nbsp;&nbsp;vue2、vue-router、vuex、axios、express、mongoDB</p>
    </div>
  </transition>
</template>

<script>
export default {
  name: "About",
  data() {
    return {
    };
  },
  methods:{
    closeAbout(){
      this.$store.commit("showAbout",false)
    }
  }
};
</script>

<style scoped>
.about {
  position: absolute;
  top: 9rem;
  left: 2rem;
  right: 2rem;
  background-color: #eee;
  z-index: 100;
  border-radius: 2%;
  padding: 0.5rem 1rem;
}

.icon-roundclose {
  font-size: 1.25rem;
  float: right;
}

.findMe {
  color: crimson;
  font-weight: bolder;
}
</style>